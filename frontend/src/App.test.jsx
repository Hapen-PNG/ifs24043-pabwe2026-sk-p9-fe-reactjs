import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import * as authApi from "./features/auth/api/authApi.js";
import * as sessionApi from "./shared/session.js";

vi.mock("./features/auth/components/AuthForm.jsx", () => ({
  default: ({ onAuthenticated }) => (
    <button type="button" onClick={() => onAuthenticated({ token: "jwt", user: { username: "nina", role: "admin" } })}>
      Masuk
    </button>
  ),
}));
vi.mock("./features/auth/modals/ProfileModal.jsx", () => ({
  default: ({ user, onUpdated, onClose }) => (
    <div role="dialog" aria-label="Profil">
      <span>{user.username}</span>
      <button type="button" onClick={() => onUpdated({ ...user, username: "nina-baru" })}>Simpan profil</button>
      <button type="button" onClick={onClose}>Tutup profil</button>
    </div>
  ),
}));
vi.mock("./features/dashboard/components/DashboardPage.jsx", () => ({
  default: () => <div>Halaman ringkasan</div>,
}));
vi.mock("./features/todos/components/TodosPage.jsx", () => ({
  default: () => <div>Halaman tugas</div>,
}));
vi.mock("./features/groups/components/GroupsPage.jsx", () => ({
  default: () => <div>Halaman grup</div>,
}));
vi.mock("./features/templates/components/TemplatesPage.jsx", () => ({
  default: () => <div>Halaman templat</div>,
}));
vi.mock("./features/ai/components/AIGenerator.jsx", () => ({
  default: () => <div>Halaman AI</div>,
}));
vi.mock("./features/admin/components/AdminPage.jsx", () => ({
  default: () => <div>Halaman admin</div>,
}));
vi.mock("./shared/components/Sidebar.jsx", () => ({
  default: ({ onNavigate, onLogout }) => (
    <nav>
      <button type="button" onClick={() => onNavigate("todos")}>Menu tugas</button>
      <button type="button" onClick={() => onNavigate("groups")}>Menu grup</button>
      <button type="button" onClick={() => onNavigate("templates")}>Menu templat</button>
      <button type="button" onClick={() => onNavigate("ai")}>Menu AI</button>
      <button type="button" onClick={() => onNavigate("admin")}>Menu admin</button>
      <button type="button" onClick={() => onNavigate("tidak-ada")}>Menu tidak dikenal</button>
      <button type="button" onClick={onLogout}>Keluar</button>
    </nav>
  ),
}));
vi.mock("./shared/components/Topbar.jsx", () => ({
  default: ({ onProfile }) => <button type="button" onClick={onProfile}>Profil</button>,
}));
vi.mock("./shared/components/Toast.jsx", () => ({
  default: ({ message, type, onClose }) => message ? (
    <div role={type === "error" ? "alert" : "status"}>
      {message}<button type="button" onClick={onClose}>Tutup pemberitahuan</button>
    </div>
  ) : null,
}));
vi.mock("./shared/session.js", () => ({
  clearSession: vi.fn(),
  loadSession: vi.fn(),
  saveSession: vi.fn(),
}));
vi.mock("./features/auth/api/authApi.js", () => ({ logout: vi.fn() }));

describe("aplikasi utama", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionApi.loadSession.mockReturnValue(null);
    authApi.logout.mockResolvedValue({});
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("mengautentikasi, menavigasi, memperbarui profil, dan keluar", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(sessionApi.saveSession).toHaveBeenCalledWith({
      token: "jwt",
      user: { username: "nina", role: "admin" },
    });
    expect(screen.getByText("Halaman ringkasan")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Menu tugas" }));
    expect(screen.getByText("Halaman tugas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu grup" }));
    expect(screen.getByText("Halaman grup")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu templat" }));
    expect(screen.getByText("Halaman templat")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu AI" }));
    expect(screen.getByText("Halaman AI")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu admin" }));
    expect(screen.getByText("Halaman admin")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu tidak dikenal" }));
    expect(screen.getByText("Halaman ringkasan")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Profil" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan profil" }));
    expect(sessionApi.saveSession).toHaveBeenLastCalledWith({
      token: "jwt",
      user: { username: "nina-baru", role: "admin" },
    });
    expect(screen.getByRole("status")).toHaveTextContent("Profil berhasil diperbarui.");
    fireEvent.click(screen.getByRole("button", { name: "Tutup pemberitahuan" }));
    fireEvent.click(screen.getByRole("button", { name: "Profil" }));
    fireEvent.click(screen.getByRole("button", { name: "Tutup profil" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));
    await waitFor(() => expect(sessionApi.clearSession).toHaveBeenCalled());
    expect(authApi.logout).toHaveBeenCalledWith("jwt");
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("menerapkan sesi tersimpan, membatasi menu admin, dan tetap keluar saat server gagal", async () => {
    sessionApi.loadSession.mockReturnValue({ token: "member-jwt", user: { username: "andi", role: "member" } });
    authApi.logout.mockRejectedValue(new Error("Keluar gagal"));
    render(<App />);
    expect(screen.getByText("Halaman ringkasan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu admin" }));
    expect(screen.getByText("Halaman ringkasan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Keluar gagal");
    fireEvent.click(screen.getByRole("button", { name: "Tutup pemberitahuan" }));
    await waitFor(() => expect(sessionApi.clearSession).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("menghapus pemberitahuan ketika batas waktu tercapai", async () => {
    vi.useFakeTimers();
    sessionApi.loadSession.mockReturnValue({ token: "jwt", user: { username: "nina", role: "member" } });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Profil" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan profil" }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(3600));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
