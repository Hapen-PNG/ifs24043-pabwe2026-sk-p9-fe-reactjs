import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TodoModal from "./TodoModal.jsx";

describe("dialog tugas", () => {
  afterEach(() => cleanup());

  it("membuat tugas dengan grup dan tenggat pilihan", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<TodoModal groups={[{ id: 2, title: "Proyek" }]} onSave={onSave} onClose={vi.fn()} />);
    await user.type(screen.getByLabelText("Judul tugas"), "Rancang halaman");
    await user.type(screen.getByLabelText("Deskripsi"), "Tulis spesifikasi");
    await user.type(screen.getByLabelText("Tenggat waktu"), "2026-12-01");
    await user.selectOptions(screen.getByLabelText("Grup tugas"), "2");
    await user.click(screen.getByRole("button", { name: "Buat tugas" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      title: "Rancang halaman",
      description: "Tulis spesifikasi",
      status: "pending",
      due_date: "2026-12-01",
      group_id: 2,
    }));
  });

  it("mengirim nilai kosong saat tugas tidak memiliki grup atau tenggat", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<TodoModal groups={[]} onSave={onSave} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Judul tugas"), { target: { value: "Baca buku" } });
    fireEvent.submit(screen.getByRole("button", { name: "Buat tugas" }).closest("form"));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      title: "Baca buku", description: "", status: "pending", due_date: "", group_id: null,
    }));
  });

  it("mengubah data, status, dan menampilkan kegagalan simpan", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Tugas gagal disimpan"));
    render(<TodoModal
      todo={{ id: 4, title: "Awal", description: "Catatan", status: "in_progress", due_date: "2026-10-12", group_id: 2 }}
      groups={[{ id: 2, title: "Kuliah" }]}
      onSave={onSave}
      onClose={vi.fn()}
    />);
    expect(screen.getByLabelText("Status")).toHaveValue("in_progress");
    await user.selectOptions(screen.getByLabelText("Status"), "completed");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tugas gagal disimpan");
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ status: "completed", group_id: 2 }));
  });
});
