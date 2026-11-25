import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadRequest(baseUrl = "") {
  vi.stubEnv("VITE_API_BASE_URL", baseUrl);
  vi.resetModules();
  return import("./http.js");
}

function responseFor(body, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(body) };
}

describe("request API", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("mengirim GET ke path relatif saat base URL kosong", async () => {
    const { request } = await loadRequest();
    fetch.mockResolvedValue(responseFor({ status: "success", data: { todos: [] } }));

    await expect(request("/api/todos")).resolves.toEqual({ todos: [] });
    expect(fetch).toHaveBeenCalledWith("/api/todos", {
      method: "GET",
      headers: { Accept: "application/json" },
      body: undefined,
      signal: undefined,
    });
  });

  it("menggunakan base URL dari environment", async () => {
    const { request } = await loadRequest("https://api.example.com");
    fetch.mockResolvedValue(responseFor({ status: "success", data: {} }));

    await request("/api/todos");
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/api/todos", expect.any(Object));
  });

  it("menghapus slash di akhir base URL agar tidak menggandakan slash", async () => {
    const { request } = await loadRequest("https://api.example.com/");
    fetch.mockResolvedValue(responseFor({ status: "success", data: {} }));

    await request("/api/todos");
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/api/todos", expect.any(Object));
  });

  it("mengirim token, metode, isi JSON, dan sinyal pembatalan", async () => {
    const { request } = await loadRequest();
    const controller = new AbortController();
    fetch.mockResolvedValue(responseFor({ status: "success", data: { id: 2 } }));

    await request("/api/todos", {
      token: "jwt",
      method: "POST",
      body: { title: "Belajar" },
      signal: controller.signal,
    });
    expect(fetch).toHaveBeenCalledWith("/api/todos", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer jwt" },
      body: JSON.stringify({ title: "Belajar" }),
      signal: controller.signal,
    });
  });

  it("mengembalikan objek kosong ketika data tidak tersedia", async () => {
    const { request } = await loadRequest();
    fetch.mockResolvedValue(responseFor({ status: "success", data: null }));
    await expect(request("/api/logout")).resolves.toEqual({});
  });

  it("menolak respons HTTP gagal dengan pesan server", async () => {
    const { request } = await loadRequest();
    fetch.mockResolvedValue(responseFor({ status: "error", message: "Server bermasalah" }, false));
    await expect(request("/api/todos")).rejects.toThrow("Server bermasalah");
  });

  it("mempertahankan pesan status API apa adanya termasuk jika kosong", async () => {
    const { request } = await loadRequest();
    fetch.mockResolvedValue(responseFor({ status: "fail", message: "" }));
    await expect(request("/api/todos")).rejects.toMatchObject({ message: "" });
  });

  it.each([404, 405])("menjelaskan respons bukan JSON dengan status HTTP %i", async (status) => {
    const { request } = await loadRequest();
    fetch.mockResolvedValue({ ok: false, status, json: vi.fn().mockRejectedValue(new SyntaxError("HTML 404")) });
    await expect(request("/api/todos")).rejects.toThrow(
      `Server tidak merespons dengan benar (HTTP ${status}). Periksa konfigurasi alamat API.`,
    );
  });

  it("memakai pesan bawaan untuk error JSON tanpa field message", async () => {
    const { request } = await loadRequest();
    fetch.mockResolvedValue(responseFor({ status: "error" }));
    await expect(request("/api/todos")).rejects.toThrow("Permintaan tidak berhasil");
  });

  it("menampilkan pesan Bahasa Indonesia saat fetch gagal karena jaringan", async () => {
    const { request } = await loadRequest();
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(request("/api/todos")).rejects.toThrow(
      "Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi nanti.",
    );
  });

  it("meneruskan error fetch selain TypeError", async () => {
    const { request } = await loadRequest();
    const error = new Error("Fetch gagal");
    fetch.mockRejectedValue(error);
    await expect(request("/api/todos")).rejects.toBe(error);
  });
});
