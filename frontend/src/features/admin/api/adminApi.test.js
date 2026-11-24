import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as adminApi from "./adminApi.js";

describe("API admin", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { users: [], todos: [] } }),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("menangani daftar anggota dan tugas anggota", async () => {
    await adminApi.listUsers("jwt");
    await adminApi.listUserTodos("jwt", 12);
    expect(fetch.mock.calls[0][0]).toContain("/admin/users");
    expect(fetch.mock.calls[1][0]).toContain("/admin/users/12/todos");
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer jwt");
  });
});
