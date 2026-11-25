import { request } from "../../../shared/api/http.js";

export const listUsers = (token) => request("/api/admin/users", { token });
export const listUserTodos = (token, userId) => request(`/api/admin/users/${userId}/todos`, { token });
