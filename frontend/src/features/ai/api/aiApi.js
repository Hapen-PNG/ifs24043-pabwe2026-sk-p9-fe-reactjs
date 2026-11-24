import { request } from "../../../shared/api/http.js";

export const generateSubtasks = (token, task) =>
  request("/todos/ai-generate", { method: "POST", token, body: { task } });
