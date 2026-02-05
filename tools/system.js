// tools/system.js
import { z } from "zod";
import { ok, fail } from "../utils/index.js";

export const registerSystemTools = (server) => {
  ping(server);
  dateTime(server);
};

const ping = (server) => {
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
    },
  );
};

const dateTime = (server) => {
  server.tool(
    "system.dateTime",
    {
      timezone: z.string().optional(),
    },
    async ({ timezone }) => {
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
    },
  );
};
