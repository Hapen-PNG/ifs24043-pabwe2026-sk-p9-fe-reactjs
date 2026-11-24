import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultApiUrl, request } from "./http.js";

function responseFor(body, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(body) };
}

describe("request API", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mengirim permintaan GET tanpa token atau isi", async () => {
    fetch.mockResolvedValue(responseFor({ status: "success", data: { todos: [] } }));
    await expect(request("/todos")).resolves.toEqual({ todos: [] });
    expect(fetch).toHaveBeenCalledWith(`${defaultApiUrl}/todos`, {
      method: "GET",
      headers: { Accept: "application/json" },
      body: undefined,
      signal: undefined,
    });
  });

  it("mengirim token, metode, isi JSON, dan sinyal pembatalan", async () => {
    const controller = new AbortController();
    fetch.mockResolvedValue(responseFor({ status: "success", data: { id: 2 } }));
    await request("/todos", {
      token: "jwt",
      method: "POST",
      body: { title: "Belajar" },
      signal: controller.signal,
    });
    expect(fetch).toHaveBeenCalledWith(`${defaultApiUrl}/todos`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer jwt" },
      body: JSON.stringify({ title: "Belajar" }),
      signal: controller.signal,
    });
  });

  it("mengembalikan objek kosong ketika data tidak tersedia", async () => {
    fetch.mockResolvedValue(responseFor({ status: "success", data: null }));
    await expect(request("/logout")).resolves.toEqual({});
  });

  it("menolak respons HTTP gagal dengan pesan server", async () => {
    fetch.mockResolvedValue(responseFor({ status: "error", message: "Server bermasalah" }, false));
    await expect(request("/todos")).rejects.toThrow("Server bermasalah");
  });

  it("menolak status API gagal dengan pesan bawaan bila pesan kosong", async () => {
    fetch.mockResolvedValue(responseFor({ status: "fail", message: "" }));
    await expect(request("/todos")).rejects.toThrow("Permintaan tidak berhasil");
  });

  it("menolak respons yang bukan JSON", async () => {
    fetch.mockResolvedValue({ ok: true, json: vi.fn().mockRejectedValue(new SyntaxError("JSON rusak")) });
    await expect(request("/todos")).rejects.toThrow("Respons server tidak valid");
  });
});
