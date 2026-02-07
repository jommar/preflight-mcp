// tools/system.js
import { z } from "zod";

import { systemDateTime, systemPing } from "./system.service.js";

export const registerSystemTools = (server) => {
  ping(server);
  dateTime(server);
};

const ping = (server) => {
  server.tool("system.ping", { message: z.string().optional() }, systemPing);
};

const dateTime = (server) => {
  server.tool(
    "system.dateTime",
    { timezone: z.string().optional() },
    systemDateTime,
  );
};
