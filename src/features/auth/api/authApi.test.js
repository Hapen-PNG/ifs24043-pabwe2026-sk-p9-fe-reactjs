import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as authApi from "./authApi.js";

describe("API autentikasi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { user: { id: 1 }, token: "jwt" } }),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("menangani pendaftaran dan login", async () => {
    const payload = { username: "sari", email: "sari@example.com", password: "rahasia" };
    await expect(authApi.register(payload)).resolves.toHaveProperty("user.id", 1);
    expect(fetch.mock.calls[0][0]).toContain("/auth/register");
    await expect(authApi.login({ username: "sari", password: "rahasia" })).resolves.toHaveProperty("token", "jwt");
    expect(fetch.mock.calls[1][0]).toContain("/auth/login");
  });

  it("menangani keluar, profil, dan perubahan profil", async () => {
    await authApi.logout("jwt");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer jwt");
    await authApi.getProfile("jwt");
    expect(fetch.mock.calls[1][0]).toContain("/auth/profile");
    await authApi.updateProfile("jwt", { username: "baru", email: "baru@example.com" });
    expect(fetch.mock.calls[2][1].method).toBe("PUT");
  });
});
