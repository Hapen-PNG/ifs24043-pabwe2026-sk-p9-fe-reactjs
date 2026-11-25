import { request } from "../../../shared/api/http.js";

export const listTodos = (token, groupId) =>
  request(`/api/todos${groupId ? `?todo_group_id=${encodeURIComponent(groupId)}` : ""}`, { token });
export const getTodo = (token, id) => request(`/api/todos/${id}`, { token });
export const createTodo = (token, payload) => request("/api/todos", { method: "POST", token, body: payload });
export const updateTodo = (token, id, payload) =>
  request(`/api/todos/${id}`, { method: "PUT", token, body: payload });
export const updateTodoStatus = (token, id, status) =>
  request(`/api/todos/${id}/status`, { method: "PATCH", token, body: { status } });
export const deleteTodo = (token, id) => request(`/api/todos/${id}`, { method: "DELETE", token });
export const getTodoStats = (token) => request("/api/todos/stats", { token });
