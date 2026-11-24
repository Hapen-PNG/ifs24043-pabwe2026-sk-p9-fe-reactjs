import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as templatesApi from "./templatesApi.js";

describe("API templat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { templates: [], template: { id: 4 } } }),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("menangani daftar, detail, dan penyalinan templat", async () => {
    await templatesApi.listTemplates();
    await templatesApi.getTemplate(4);
    await templatesApi.cloneTemplate("jwt", 4);
    expect(fetch.mock.calls.map(([url, options]) => [url, options.method || "GET"])).toEqual([
      ["http://localhost:8080/api/templates", "GET"],
      ["http://localhost:8080/api/templates/4", "GET"],
      ["http://localhost:8080/api/templates/4/clone", "POST"],
    ]);
  });
});
