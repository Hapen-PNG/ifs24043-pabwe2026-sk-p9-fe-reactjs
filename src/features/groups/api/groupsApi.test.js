import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as groupsApi from "./groupsApi.js";

describe("API grup tugas", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { groups: [], group: { id: 3 } } }),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("menangani daftar, detail, pembuatan, perubahan, dan penghapusan grup", async () => {
    await groupsApi.listGroups("jwt");
    await groupsApi.getGroup("jwt", 3);
    await groupsApi.createGroup("jwt", { title: "Kuliah" });
    await groupsApi.updateGroup("jwt", 3, { title: "Kuliah baru" });
    await groupsApi.deleteGroup("jwt", 3);
    expect(fetch.mock.calls.map(([url, options]) => [url, options.method || "GET"])).toEqual([
      ["/api/todo-groups", "GET"],
      ["/api/todo-groups/3", "GET"],
      ["/api/todo-groups", "POST"],
      ["/api/todo-groups/3", "PUT"],
      ["/api/todo-groups/3", "DELETE"],
    ]);
  });
});
