// tools/index.js
import { registerSystemTools } from "./system.js";

export const registerAllTools = (server) => {
  registerSystemTools(server);
};
