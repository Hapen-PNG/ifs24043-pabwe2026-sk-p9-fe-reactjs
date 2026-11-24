import { request } from "../../../shared/api/http.js";

export const register = (payload) => request("/auth/register", { method: "POST", body: payload });
export const login = (payload) => request("/auth/login", { method: "POST", body: payload });
export const logout = (token) => request("/auth/logout", { method: "POST", token });
export const getProfile = (token) => request("/auth/profile", { token });
export const updateProfile = (token, payload) =>
  request("/auth/profile", { method: "PUT", token, body: payload });
