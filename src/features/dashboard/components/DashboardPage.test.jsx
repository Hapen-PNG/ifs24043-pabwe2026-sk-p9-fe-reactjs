import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage.jsx";
import * as todosApi from "../../todos/api/todosApi.js";
import * as groupsApi from "../../groups/api/groupsApi.js";

vi.mock("../../todos/api/todosApi.js", () => ({
  getTodoStats: vi.fn(),
  listTodos: vi.fn(),
}));
vi.mock("../../groups/api/groupsApi.js", () => ({ listGroups: vi.fn() }));

describe("ringkasan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    todosApi.getTodoStats.mockResolvedValue({ stats: { total: 5, total_selesai: 2, belum_selesai: 3 } });
    todosApi.listTodos.mockResolvedValue({ todos: [{ id: 1, title: "Tugas A", status: "pending", group: { title: "Kampus" } }] });
    groupsApi.listGroups.mockResolvedValue({ groups: [{ id: 2, title: "Kampus" }] });
  });
  afterEach(() => cleanup());

  it("menampilkan statistik dan navigasi ke fitur lain", async () => {
    const onNavigate = vi.fn();
    render(<DashboardPage token="jwt" user={{ username: "nina" }} onNavigate={onNavigate} />);
    expect(await screen.findByText("Tugas A")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Halo, nina/ })).toBeInTheDocument();
    await screen.findByText("Kampus");
    screen.getByRole("button", { name: "Lihat tugas saya" }).click();
    screen.getByRole("button", { name: "Lihat semua" }).click();
    screen.getByRole("button", { name: "Buat rencana dengan AI" }).click();
    expect(onNavigate).toHaveBeenNthCalledWith(1, "todos");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "todos");
    expect(onNavigate).toHaveBeenNthCalledWith(3, "ai");
  });

  it("menangani daftar kosong dan nilai statistik bawaan", async () => {
    todosApi.getTodoStats.mockResolvedValue({ stats: null });
    todosApi.listTodos.mockResolvedValue({ todos: null });
    groupsApi.listGroups.mockResolvedValue({ groups: null });
    render(<DashboardPage token="jwt" user={{ username: "andi" }} onNavigate={vi.fn()} />);
    expect(await screen.findByText("Belum ada tugas. Tambahkan langkah pertama Anda.")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(4);
  });

  it("menampilkan kesalahan saat ringkasan gagal dimuat", async () => {
    todosApi.getTodoStats.mockRejectedValue(new Error("Ringkasan gagal dimuat"));
    render(<DashboardPage token="jwt" user={{ username: "andi" }} onNavigate={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Ringkasan gagal dimuat");
    await waitFor(() => expect(todosApi.getTodoStats).toHaveBeenCalledWith("jwt"));
  });

  it("menampilkan status tugas dan grup tanpa nama", async () => {
    todosApi.listTodos.mockResolvedValue({
      todos: [
        { id: 1, title: "Kirim prototipe", status: "completed" },
        { id: 2, title: "Baca panduan", status: "in_progress", group: {} },
        { id: 3, title: "Rapikan catatan", status: "pending", group: { title: "Kampus" } },
      ],
    });
    render(<DashboardPage token="jwt" user={{ username: "nina" }} onNavigate={vi.fn()} />);
    expect(await screen.findByText("Kirim prototipe")).toBeInTheDocument();
    expect(screen.getByText("Baca panduan")).toBeInTheDocument();
    expect(screen.getByText("Rapikan catatan")).toBeInTheDocument();
    expect(screen.getAllByText("Tanpa grup")).toHaveLength(2);
  });

  it("mengabaikan hasil ringkasan setelah halaman ditutup", async () => {
    let resolveStats;
    todosApi.getTodoStats.mockReturnValueOnce(new Promise((resolve) => { resolveStats = resolve; }));
    const { unmount } = render(<DashboardPage token="jwt" user={{ username: "andi" }} onNavigate={vi.fn()} />);
    unmount();
    await act(async () => resolveStats({ stats: null }));
  });
});
