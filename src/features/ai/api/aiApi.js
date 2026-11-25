import { request } from "../../../shared/api/http.js";

export const generateSubtasks = (token, task) =>
  request("/api/todos/ai-generate", { method: "POST", token, body: { task } });
