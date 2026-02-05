// tools/system.js
import { z } from "zod";
import { ok } from "../utils/index.js";

export const registerSystemTools = (server) => {
  server.tool(
    "system.ping",
    {
      message: z.string().optional(),
    },
    async ({ message }) => {
      return ok({
        pong: true,
        message: message ?? null,
      });
    }
  );
};
