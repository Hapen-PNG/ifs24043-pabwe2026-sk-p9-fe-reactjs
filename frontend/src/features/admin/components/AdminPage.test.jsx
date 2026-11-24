import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "./AdminPage.jsx";
import * as adminApi from "../api/adminApi.js";

vi.mock("../api/adminApi.js", () => ({
  listUsers: vi.fn(),
  listUserTodos: vi.fn(),
}));

describe("panel admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.listUsers.mockResolvedValue({
      users: [{
        user: { id: 2, username: "sari", email: "sari@example.com", role: "member" },
        stats: { total: 3, total_selesai: 1 },
      }],
    });
    adminApi.listUserTodos.mockResolvedValue({
      todos: [{ id: 5, title: "Belajar", status: "in_progress" }],
    });
  });
  afterEach(() => cleanup());

  it("memilih anggota dan menampilkan daftar tugasnya", async () => {
    render(<AdminPage token="jwt" />);
    expect(await screen.findByText("sari@example.com")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /sari/ }));
    await waitFor(() => expect(adminApi.listUserTodos).toHaveBeenCalledWith("jwt", 2));
    expect(await screen.findByText("Belajar")).toBeInTheDocument();
    expect(screen.getByText("Sedang dikerjakan")).toBeInTheDocument();
  });

  it("menampilkan keadaan kosong dan kesalahan pemuatan anggota", async () => {
    adminApi.listUsers.mockResolvedValueOnce({ users: [] });
    const { rerender } = render(<AdminPage token="jwt" />);
    expect(await screen.findByText("Belum ada akun.")).toBeInTheDocument();
    adminApi.listUsers.mockRejectedValueOnce(new Error("Tidak dapat memuat anggota"));
    rerender(<AdminPage token="jwt-2" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Tidak dapat memuat anggota");
  });

  it("menangani kesalahan dan daftar tugas kosong", async () => {
    adminApi.listUserTodos.mockRejectedValueOnce(new Error("Tugas tidak dapat dimuat"));
    render(<AdminPage token="jwt" />);
    await screen.findByText("sari@example.com");
    fireEvent.click(screen.getByRole("button", { name: /sari/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tugas tidak dapat dimuat");

    adminApi.listUserTodos.mockResolvedValueOnce({ todos: [] });
    fireEvent.click(screen.getByRole("button", { name: /sari/ }));
    expect(await screen.findByText("Anggota ini belum memiliki tugas.")).toBeInTheDocument();
  });

  it("menampilkan peran admin dan seluruh status serta menerima daftar kosong", async () => {
    const user = { id: 8, username: "admin", email: "admin@example.com", role: "admin" };
    adminApi.listUsers.mockResolvedValueOnce({ users: [{ user, stats: { total: 3, total_selesai: 1 } }] });
    adminApi.listUserTodos.mockResolvedValueOnce({
      todos: [
        { id: 1, title: "Tugas selesai", status: "completed" },
        { id: 2, title: "Menunggu", status: "pending" },
      ],
    });
    const { rerender } = render(<AdminPage token="jwt" />);
    expect(await screen.findByText("Admin")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /admin/ }));
    expect(await screen.findByText("Tugas selesai")).toBeInTheDocument();
    expect(screen.getByText("Belum dimulai")).toBeInTheDocument();

    adminApi.listUsers.mockResolvedValueOnce({ users: null });
    rerender(<AdminPage token="jwt-2" />);
    expect(await screen.findByText("Belum ada akun.")).toBeInTheDocument();
  });

  it("mengabaikan hasil anggota setelah halaman ditutup", async () => {
    let resolveUsers;
    adminApi.listUsers.mockReturnValueOnce(new Promise((resolve) => { resolveUsers = resolve; }));
    const { unmount } = render(<AdminPage token="jwt" />);
    unmount();
    await act(async () => resolveUsers({ users: [] }));
  });

  it("menerima daftar tugas bernilai kosong", async () => {
    adminApi.listUserTodos.mockResolvedValueOnce({ todos: null });
    render(<AdminPage token="jwt" />);
    fireEvent.click(await screen.findByRole("button", { name: /sari/ }));
    expect(await screen.findByText("Anggota ini belum memiliki tugas.")).toBeInTheDocument();
  });
});
