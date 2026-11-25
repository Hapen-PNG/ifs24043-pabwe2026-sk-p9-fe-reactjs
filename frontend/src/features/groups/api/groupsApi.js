import { request } from "../../../shared/api/http.js";

export const listGroups = (token) => request("/api/todo-groups", { token });
export const getGroup = (token, id) => request(`/api/todo-groups/${id}`, { token });
export const createGroup = (token, payload) =>
  request("/api/todo-groups", { method: "POST", token, body: payload });
export const updateGroup = (token, id, payload) =>
  request(`/api/todo-groups/${id}`, { method: "PUT", token, body: payload });
export const deleteGroup = (token, id) =>
  request(`/api/todo-groups/${id}`, { method: "DELETE", token });
