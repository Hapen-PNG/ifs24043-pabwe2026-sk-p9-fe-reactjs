import { request } from "../../../shared/api/http.js";

export const listTemplates = () => request("/templates");
export const getTemplate = (id) => request(`/templates/${id}`);
export const cloneTemplate = (token, id) =>
  request(`/templates/${id}/clone`, { method: "POST", token });
