import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateSubtasks } from "./aiApi.js";

describe("API asisten AI", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { subtasks: ["Riset"] } }),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("mengirim tugas dengan token dan menerima daftar subtugas", async () => {
    await expect(generateSubtasks("jwt", "Buat presentasi")).resolves.toEqual({ subtasks: ["Riset"] });
    expect(fetch.mock.calls[0][0]).toContain("/todos/ai-generate");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer jwt");
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ task: "Buat presentasi" }));
  });
});
