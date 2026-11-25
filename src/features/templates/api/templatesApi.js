import { request } from "../../../shared/api/http.js";

export const listTemplates = () => request("/api/templates");
export const getTemplate = (id) => request(`/api/templates/${id}`);
export const cloneTemplate = (token, id) =>
  request(`/api/templates/${id}/clone`, { method: "POST", token });
