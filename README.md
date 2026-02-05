# Preflight MCP Server – Developer Guide

This document is for **developers working on Preflight**.
It explains how to add new tools (endpoints), wire services, and follow the project conventions.

If you are new to MCP: think of this project as a **backend API for AI**.

---

## Mental model

- The **AI is the client**
- MCP tools are **controllers**
- Services contain **business logic**
- Adapters handle **I/O (DB, APIs, files)**

Rule of thumb:

> Tools should read like controllers.  
> Services should read like pure functions.

---

## Directory responsibilities

```
tools/      → Controllers (AI-facing)
services/   → Business logic
adapters/   → Data access / external systems
schemas/    → Validation & contracts (Zod)
utils/      → Shared helpers (envelope, etc.)
```

### What NOT to do
- ❌ Don’t fetch data directly inside tools
- ❌ Don’t return raw objects from tools
- ❌ Don’t put MCP logic inside services

---

## Adding a new tool (step-by-step)

Example: `patient.getSummary`

### 1. Create the tool file

```
tools/patient.js
```

### 2. Register the tool

```js
// tools/patient.js
import { z } from "zod";
import { ok, fail } from "../utils/index.js";
import { patientService } from "../services/index.js";

export const registerPatientTools = (server) => {
  server.tool(
    "patient.getSummary",
    {
      patientId: z.string(),
    },
    async ({ patientId }) => {
      try {
        const data = await patientService.getSummary(patientId);
        return ok(data);
      } catch (err) {
        return fail(err.message);
      }
    }
  );
};
```

### 3. Export from `tools/index.js`

```js
// tools/index.js
import { registerPatientTools } from "./patient.js";

export const registerAllTools = (server) => {
  registerPatientTools(server);
};
```

That’s it. The AI can now call `patient.getSummary`.

---

## Writing services

Services contain **domain logic only**.

```js
// services/patient.service.js
export const patientService = {
  async getSummary(patientId) {
    return {
      id: patientId,
      name: "Mock Patient",
    };
  },
};
```

Rules:
- No MCP imports
- No Zod
- No formatting logic

Services should be reusable outside MCP.

---

## Adapters (data access)

Adapters are where I/O lives.

Examples:
- Database queries
- HTTP requests
- File system access
- FHIR / EHR calls

```js
// adapters/db.adapter.js
export const dbAdapter = {
  async getPatientById(id) {
    // query DB here
  },
};
```

Adapters may:
- Retry
- Normalize data
- Handle credentials

Adapters must NOT:
- Know about MCP
- Know about AI prompts

---

## Schemas

Schemas define **input contracts**.

```js
import { z } from "zod";

export const patientIdSchema = z.string().uuid();
```

Use schemas in tools only.

---

## Returning responses (important)

All tools MUST return MCP-compatible responses.

Always use the envelope helpers:

```js
import { ok, fail } from "../utils/index.js";

return ok({ result: "value" });
```

Never do:

```js
return { result: "value" }; // ❌
```

If you forget this, MCP clients will show empty results.

---

## Error handling pattern

- Validate input with Zod
- Catch errors in tools
- Return `fail()` with a safe message

Do NOT throw uncaught errors from tools.

---

## Local development

```bash
npm run dev
```

Notes:
- MCP uses stdio
- Restarting breaks the client connection
- Just reconnect the client when nodemon restarts

---

## Debugging tips

- If tool returns `[]`, check the response shape
- If tool doesn’t appear, check `tools/index.js`
- Use MCP Inspector when in doubt

```bash
npx @modelcontextprotocol/inspector@latest
```

---

## Design principles

- Read first, answer second
- Prefer explicit tools over guessing
- Keep tools small
- Keep services pure
- Centralize protocol quirks in utils

---

## Checklist before committing

- [ ] Tool registered in tools/index.js
- [ ] Uses envelope helpers
- [ ] Business logic in services
- [ ] No MCP imports outside tools
- [ ] No raw returns

---
