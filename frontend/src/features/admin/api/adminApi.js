import { request } from "../../../shared/api/http.js";

export const listUsers = (token) => request("/admin/users", { token });
export const listUserTodos = (token, userId) => request(`/admin/users/${userId}/todos`, { token });
