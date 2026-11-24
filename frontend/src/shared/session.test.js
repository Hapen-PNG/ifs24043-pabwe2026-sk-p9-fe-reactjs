import { afterEach, describe, expect, it } from "vitest";
import { clearSession, loadSession, saveSession } from "./session.js";

describe("penyimpanan sesi", () => {
  afterEach(() => localStorage.clear());

  it("mengembalikan null saat sesi belum tersedia", () => {
    expect(loadSession()).toBeNull();
  });

  it("menyimpan, membaca, dan menghapus sesi", () => {
    const session = { token: "jwt", user: { id: 3, username: "andi" } };
    saveSession(session);
    expect(loadSession()).toEqual(session);
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it("menghapus data sesi yang tidak lengkap atau rusak", () => {
    localStorage.setItem("todolist-pro-session", JSON.stringify({ token: "jwt" }));
    expect(loadSession()).toBeNull();
    localStorage.setItem("todolist-pro-session", "{");
    expect(loadSession()).toBeNull();
    expect(localStorage.getItem("todolist-pro-session")).toBeNull();
  });
});
