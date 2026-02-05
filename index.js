// index.js
import process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerAllTools } from "./tools/index.js";

const main = async () => {
  const server = new McpServer({
    name: "preflight",
    version: "0.1.0",
  });

  // Keep index.js stable: all tool registration lives in tools/
  registerAllTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so we don't interfere with MCP stdio protocol
  console.error("[preflight] MCP server started");

  const shutdown = async (signal) => {
    try {
      console.error(`[preflight] shutting down (${signal})`);
      // Some SDK versions expose close()/disconnect(); if not, just exit.
      await server.close?.();
    } catch (error) {
      console.error("[preflight] shutdown error:", error);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

main().catch((error) => {
  console.error("[preflight] fatal:", error);
  process.exit(1);
});
