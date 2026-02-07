// tools/index.js
import { registerSystemTools } from "./system.tool.js";

export const registerAllTools = (server) => {
  registerSystemTools(server);
};
