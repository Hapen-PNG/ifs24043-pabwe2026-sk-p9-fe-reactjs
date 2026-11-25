import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TodosPage, { displayDate, statusNames } from "./TodosPage.jsx";
import * as todosApi from "../api/todosApi.js";
import * as groupsApi from "../../groups/api/groupsApi.js";

vi.mock("../api/todosApi.js", () => ({
  listTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  updateTodoStatus: vi.fn(),
  deleteTodo: vi.fn(),
}));
vi.mock("../../groups/api/groupsApi.js", () => ({ listGroups: vi.fn() }));

const initialTodos = [
  { id: 1, title: "Belajar React", description: "Baca panduan", status: "pending", due_date: "2026-12-01", group: { title: "Kuliah" } },
  { id: 2, title: "Kirim laporan", description: "", status: "completed", due_date: null },
];

describe("halaman tugas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    todosApi.listTodos.mockResolvedValue({ todos: initialTodos });
    todosApi.createTodo.mockResolvedValue({ todo: { id: 3 } });
    todosApi.updateTodo.mockResolvedValue({ todo: { id: 1 } });
    todosApi.updateTodoStatus.mockResolvedValue({ todo: { id: 1 } });
    todosApi.deleteTodo.mockResolvedValue({});
    groupsApi.listGroups.mockResolvedValue({ groups: [{ id: 5, title: "Kuliah" }] });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("menampilkan tugas, status, tenggat, dan grup", async () => {
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    expect(await screen.findByText("Belajar React")).toBeInTheDocument();
    expect(screen.getByText("Kirim laporan")).toBeInTheDocument();
    expect(screen.getByText(/Des 2026/)).toBeInTheDocument();
    expect(within(screen.getByRole("heading", { name: "Belajar React" }).closest("article")).getByText("Kuliah")).toBeInTheDocument();
    expect(within(screen.getByRole("heading", { name: "Kirim laporan" }).closest("article")).getByText("Selesai")).toBeInTheDocument();
  });

  it("menerapkan pencarian dan filter status", async () => {
    const user = userEvent.setup();
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    await screen.findByText("Belajar React");
    await user.type(screen.getByRole("textbox", { name: "Cari tugas" }), "laporan");
    expect(screen.queryByText("Belajar React")).not.toBeInTheDocument();
    expect(screen.getByText("Kirim laporan")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Filter status"), "pending");
    expect(screen.getByText("Tugas tidak ditemukan")).toBeInTheDocument();
  });

  it("memfilter daftar berdasarkan grup dan menampilkan keadaan kosong", async () => {
    const user = userEvent.setup();
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    await screen.findByText("Belajar React");
    await user.selectOptions(screen.getByLabelText("Filter grup"), "5");
    await waitFor(() => expect(todosApi.listTodos).toHaveBeenLastCalledWith("jwt", "5"));
  });

  it("membuat dan mengubah tugas", async () => {
    const user = userEvent.setup();
    const notify = vi.fn();
    render(<TodosPage token="jwt" notify={notify} />);
    await screen.findByText("Belajar React");
    await user.click(screen.getByRole("button", { name: /Tugas baru/ }));
    await user.type(screen.getByLabelText("Judul tugas"), "Tugas baru");
    await user.click(screen.getByRole("button", { name: "Buat tugas" }));
    await waitFor(() => expect(todosApi.createTodo).toHaveBeenCalled());
    expect(notify).toHaveBeenCalledWith("Tugas berhasil dibuat.");

    await user.click(screen.getByRole("button", { name: "Ubah Belajar React" }));
    await user.clear(screen.getByLabelText("Judul tugas"));
    await user.type(screen.getByLabelText("Judul tugas"), "Belajar komponen");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(todosApi.updateTodo).toHaveBeenCalledWith("jwt", 1, expect.objectContaining({ title: "Belajar komponen" })));
    expect(notify).toHaveBeenCalledWith("Tugas berhasil diperbarui.");
  });

  it("menghapus atau membatalkan penghapusan tugas", async () => {
    const user = userEvent.setup();
    const notify = vi.fn();
    vi.stubGlobal("confirm", vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true));
    render(<TodosPage token="jwt" notify={notify} />);
    await screen.findByText("Belajar React");
    await user.click(screen.getByRole("button", { name: "Hapus Belajar React" }));
    expect(todosApi.deleteTodo).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Hapus Belajar React" }));
    await waitFor(() => expect(todosApi.deleteTodo).toHaveBeenCalledWith("jwt", 1));
    expect(notify).toHaveBeenCalledWith("Tugas berhasil dihapus.");
  });

  it("mengubah status dan menampilkan kesalahan pemuatan", async () => {
    const user = userEvent.setup();
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    await screen.findByText("Belajar React");
    await user.click(screen.getByRole("button", { name: "Tandai selesai" }));
    await waitFor(() => expect(todosApi.updateTodoStatus).toHaveBeenCalledWith("jwt", 1, "completed"));
    await user.click(screen.getByRole("button", { name: "Tandai belum selesai" }));
    await waitFor(() => expect(todosApi.updateTodoStatus).toHaveBeenCalledWith("jwt", 2, "pending"));

    todosApi.listTodos.mockRejectedValue(new Error("Tidak dapat memuat tugas"));
    const { rerender } = render(<TodosPage token="jwt-2" notify={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Tidak dapat memuat tugas");
    rerender(<TodosPage token="jwt-3" notify={vi.fn()} />);
  });

  it("menampilkan kesalahan saat aksi gagal", async () => {
    const user = userEvent.setup();
    todosApi.updateTodoStatus.mockRejectedValue(new Error("Status gagal"));
    todosApi.listTodos.mockResolvedValue({ todos: [initialTodos[0]] });
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    await screen.findByText("Belajar React");
    await user.click(screen.getByRole("button", { name: "Tandai selesai" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Status gagal");
  });

  it("menampilkan keadaan kosong dan hasil tanggal", async () => {
    todosApi.listTodos.mockResolvedValue({ todos: null });
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    expect(await screen.findByText("Belum ada tugas")).toBeInTheDocument();
    expect(displayDate(null)).toBe("Tanpa tenggat");
    expect(displayDate("2026-12-01")).toBe("1 Des 2026");
    expect(statusNames.completed).toBe("Selesai");
  });

  it("membuka dan menutup formulir saat belum ada tugas", async () => {
    const user = userEvent.setup();
    todosApi.listTodos.mockResolvedValue({ todos: null });
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    await screen.findByText("Belum ada tugas");
    await user.click(screen.getByRole("button", { name: "Buat tugas" }));
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menampilkan kesalahan penghapusan, status tak dikenal, dan grup kosong", async () => {
    todosApi.listTodos.mockResolvedValue({
      todos: [{ id: 6, title: "Tugas khusus", status: "ditunda" }],
    });
    groupsApi.listGroups.mockResolvedValue({ groups: null });
    todosApi.deleteTodo.mockRejectedValue(new Error("Tugas gagal dihapus"));
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    render(<TodosPage token="jwt" notify={vi.fn()} />);
    expect(await screen.findByText("ditunda")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filter grup" }).children).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Hapus Tugas khusus" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tugas gagal dihapus");
  });
});
