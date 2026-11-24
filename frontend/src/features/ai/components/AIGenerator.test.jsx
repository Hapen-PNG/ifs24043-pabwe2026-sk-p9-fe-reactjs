import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AIGenerator from "./AIGenerator.jsx";
import * as aiApi from "../api/aiApi.js";
import * as todosApi from "../../todos/api/todosApi.js";

vi.mock("../api/aiApi.js", () => ({ generateSubtasks: vi.fn() }));
vi.mock("../../todos/api/todosApi.js", () => ({ createTodo: vi.fn() }));

describe("asisten AI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiApi.generateSubtasks.mockResolvedValue({ subtasks: ["Kumpulkan bahan", "Susun kerangka"] });
    todosApi.createTodo.mockResolvedValue({});
  });
  afterEach(() => cleanup());

  it("menguraikan tujuan dan menambahkan semua subtugas", async () => {
    const user = userEvent.setup();
    const notify = vi.fn();
    render(<AIGenerator token="jwt" notify={notify} />);
    expect(screen.getByText("Subtugas yang disarankan akan muncul di sini.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Tugas utama"), "Siapkan presentasi");
    await user.click(screen.getByRole("button", { name: /Buat subtugas/ }));
    expect(await screen.findByText("Kumpulkan bahan")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tambahkan semua ke daftar tugas" }));
    await waitFor(() => expect(todosApi.createTodo).toHaveBeenCalledTimes(2));
    expect(notify).toHaveBeenCalledWith("2 tugas berhasil ditambahkan.");
    expect(screen.getByText("Subtugas yang disarankan akan muncul di sini.")).toBeInTheDocument();
  });

  it("menampilkan pesan saat AI atau pembuatan tugas gagal", async () => {
    const user = userEvent.setup();
    aiApi.generateSubtasks.mockRejectedValueOnce(new Error("AI sedang sibuk"));
    render(<AIGenerator token="jwt" notify={vi.fn()} />);
    await user.type(screen.getByLabelText("Tugas utama"), "Rancang aplikasi");
    await user.click(screen.getByRole("button", { name: /Buat subtugas/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("AI sedang sibuk");

    aiApi.generateSubtasks.mockResolvedValueOnce({ subtasks: ["Langkah pertama"] });
    todosApi.createTodo.mockRejectedValueOnce(new Error("Tugas tidak tersimpan"));
    await user.click(screen.getByRole("button", { name: /Buat subtugas/ }));
    await screen.findByText("Langkah pertama");
    await user.click(screen.getByRole("button", { name: "Tambahkan semua ke daftar tugas" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tugas tidak tersimpan");
  });

  it("menangani hasil subtugas kosong", async () => {
    aiApi.generateSubtasks.mockResolvedValue({ subtasks: null });
    render(<AIGenerator token="jwt" notify={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Tugas utama"), { target: { value: "Tugas besar" } });
    fireEvent.submit(screen.getByRole("button", { name: /Buat subtugas/ }).closest("form"));
    expect(await screen.findByText("Subtugas yang disarankan akan muncul di sini.")).toBeInTheDocument();
  });
});
