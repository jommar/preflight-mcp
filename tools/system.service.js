import { ok, fail } from "../utils/index.js";

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

export const systemPing = async ({ message }) => {
  return ok({
    pong: true,
    message: message ?? null,
  });
};
