import { request } from "../../../shared/api/http.js";

export const register = (payload) => request("/api/auth/register", { method: "POST", body: payload });
export const login = (payload) => request("/api/auth/login", { method: "POST", body: payload });
export const logout = (token) => request("/api/auth/logout", { method: "POST", token });
export const getProfile = (token) => request("/api/auth/profile", { token });
export const updateProfile = (token, payload) =>
  request("/api/auth/profile", { method: "PUT", token, body: payload });
