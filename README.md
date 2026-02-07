# Preflight MCP Server – Developer Guide

This document is for **developers working on Preflight**.
It explains how to add new MCP tools, wire services, and follow the project conventions.

If you are new to MCP: think of this project as a **backend API for AI**.

---

## Mental model

- The **AI** is a client (via MCP / stdio)
- **MCP tools** are controllers
- **HTTP routes** are controllers
- **Services** contain business logic
- **Adapters** handle I/O (DB, files)

Rule of thumb:

> Controllers orchestrate.  
> Services calculate.  
> Adapters talk to the outside world.

---

## Directory responsibilities

```
tools/        → MCP controllers (AI-facing)
services/     → Business logic (shared)
adapters/     → Data access / external systems
schemas/      → Validation & contracts (Zod)
utils/        → Shared helpers (envelope, etc.)
```

### What NOT to do
- ❌ Don’t fetch data directly inside tools or routes
- ❌ Don’t return raw objects from MCP tools
- ❌ Don’t put MCP logic inside services
- ❌ Don’t duplicate business logic between MCP and HTTP

---

## Architecture overview

```
MCP Client ──▶ tools/*.tool.js ──▶ services/*.service.js ──▶ adapters/*
```

- MCP tools and HTTP routes **share the same services**
- Services are reusable and testable
- Transport (MCP vs HTTP) is just an implementation detail

---

## Adding a new MCP tool

Example: `system.dateTime`

### 1. Create the tool file

```
tools/system.tool.js
```

### 2. Register the tool

```js
// tools/system.tool.js
import { z } from "zod";
import { ok, fail } from "../utils/index.js";
import { systemService } from "../services/system.service.js";

export const registerSystemTools = (server) => {
  server.tool(
    "system.dateTime",
    { timezone: z.string().optional() },
    systemDateTime,
  );
};
```

### 3. Export from `tools/index.js`

```js
import { registerSystemTools } from "./system.tool.js";

export const registerAllTools = (server) => {
  registerSystemTools(server);
};
```

That’s it. The AI can now call `system.dateTime`.

---

## Writing services

Services contain **pure domain logic** and are shared by MCP tools and HTTP routes.

```js
// services/system.service.js
export const systemDateTime = async ({ timezone }) => {
  try {
    const tz = timezone ?? "UTC";
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      dateStyle: "short",
      timeStyle: "medium",
      hour12: false,
    }).formatToParts(now);

    const get = (type) => parts.find((p) => p.type === type)?.value;

    const date = `${get("year")}-${get("month")}-${get("day")}`;
    const time = `${get("hour")}:${get("minute")}:${get("second")}`;

    return ok({
      dateTime: `${date}T${time}`,
      date,
      time,
      timezone: tz,
    });
  } catch (error) {
    return fail(error);
  }
};
```

Rules:
- No MCP imports
- No Express imports
- No Zod
- No envelopes

Services must be reusable everywhere.

---

## Returning responses (MCP)

All MCP tools MUST return MCP-compatible envelopes.

```js
import { ok, fail } from "../utils/index.js";

return ok({ result: "value" });
```

Never return raw objects from tools.

---

## Error handling pattern

- Validate input at the boundary (tools / routes)
- Catch errors in controllers
- Return safe, user-facing messages

Do NOT throw uncaught errors from MCP tools.

---

## Local development

### MCP server

```bash
npm run start
```

Notes:
- MCP uses stdio
- Restarting breaks the client connection
- Reconnect the client after restart

## Debugging tips

- If a tool doesn’t appear, check `tools/index.js`
- If results are empty, check the MCP envelope shape (`ok`, `data`, `meta`)
- Use the MCP Inspector to introspect tools and responses

```bash
npm run mcp:inspect
```

---

## Design principles

- Keep controllers thin
- Keep services pure
- Share logic across transports
- Name MCP tools clearly
- Centralize protocol quirks in utils

---

## Checklist before committing

- [ ] Tool file named `*.tool.js`
- [ ] Tool registered in `tools/index.js`
- [ ] Service file named `*.service.js`
- [ ] Services reused by MCP
- [ ] No MCP imports outside tools
- [ ] No raw returns from MCP tools
