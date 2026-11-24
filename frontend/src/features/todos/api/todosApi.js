import { request } from "../../../shared/api/http.js";

export const listTodos = (token, groupId) =>
  request(`/todos${groupId ? `?todo_group_id=${encodeURIComponent(groupId)}` : ""}`, { token });
export const getTodo = (token, id) => request(`/todos/${id}`, { token });
export const createTodo = (token, payload) => request("/todos", { method: "POST", token, body: payload });
export const updateTodo = (token, id, payload) =>
  request(`/todos/${id}`, { method: "PUT", token, body: payload });
export const updateTodoStatus = (token, id, status) =>
  request(`/todos/${id}/status`, { method: "PATCH", token, body: { status } });
export const deleteTodo = (token, id) => request(`/todos/${id}`, { method: "DELETE", token });
export const getTodoStats = (token) => request("/todos/stats", { token });
