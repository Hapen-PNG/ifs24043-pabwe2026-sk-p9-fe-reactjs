import { request } from "../../../shared/api/http.js";

export const listGroups = (token) => request("/todo-groups", { token });
export const getGroup = (token, id) => request(`/todo-groups/${id}`, { token });
export const createGroup = (token, payload) =>
  request("/todo-groups", { method: "POST", token, body: payload });
export const updateGroup = (token, id, payload) =>
  request(`/todo-groups/${id}`, { method: "PUT", token, body: payload });
export const deleteGroup = (token, id) =>
  request(`/todo-groups/${id}`, { method: "DELETE", token });
