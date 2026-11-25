import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GroupsPage from "./GroupsPage.jsx";
import * as groupsApi from "../api/groupsApi.js";

vi.mock("../api/groupsApi.js", () => ({
  listGroups: vi.fn(),
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
}));

describe("halaman grup tugas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    groupsApi.listGroups.mockResolvedValue({
      groups: [{ id: 1, title: "Proyek kampus", description: "Semester ini", is_public: true, todos: [{ id: 2 }] }],
    });
    groupsApi.createGroup.mockResolvedValue({});
    groupsApi.updateGroup.mockResolvedValue({});
    groupsApi.deleteGroup.mockResolvedValue({});
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("menampilkan grup dan informasi visibilitas", async () => {
    render(<GroupsPage token="jwt" notify={vi.fn()} />);
    expect(await screen.findByText("Proyek kampus")).toBeInTheDocument();
    expect(screen.getByText("1 tugas")).toBeInTheDocument();
    expect(screen.getByText("Publik")).toBeInTheDocument();
  });

  it("membuat dan mengubah grup", async () => {
    const user = userEvent.setup();
    const notify = vi.fn();
    render(<GroupsPage token="jwt" notify={notify} />);
    await screen.findByText("Proyek kampus");
    await user.click(screen.getByRole("button", { name: /Grup baru/ }));
    await user.type(screen.getByLabelText("Nama grup"), "Pekerjaan");
    await user.click(screen.getByRole("button", { name: "Buat grup" }));
    await waitFor(() => expect(groupsApi.createGroup).toHaveBeenCalledWith("jwt", expect.objectContaining({ title: "Pekerjaan" })));
    expect(notify).toHaveBeenCalledWith("Grup berhasil dibuat.");

    await user.click(screen.getByRole("button", { name: "Ubah" }));
    await user.clear(screen.getByLabelText("Nama grup"));
    await user.type(screen.getByLabelText("Nama grup"), "Proyek akhir");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(groupsApi.updateGroup).toHaveBeenCalledWith("jwt", 1, expect.objectContaining({ title: "Proyek akhir" })));
    expect(notify).toHaveBeenCalledWith("Grup berhasil diperbarui.");
  });

  it("membatalkan atau menghapus grup", async () => {
    const user = userEvent.setup();
    const notify = vi.fn();
    vi.stubGlobal("confirm", vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true));
    render(<GroupsPage token="jwt" notify={notify} />);
    await screen.findByText("Proyek kampus");
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    expect(groupsApi.deleteGroup).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    await waitFor(() => expect(groupsApi.deleteGroup).toHaveBeenCalledWith("jwt", 1));
    expect(notify).toHaveBeenCalledWith("Grup berhasil dihapus.");
  });

  it("menampilkan keadaan kosong dan kesalahan pemuatan", async () => {
    groupsApi.listGroups.mockResolvedValueOnce({ groups: [] });
    const { rerender } = render(<GroupsPage token="jwt" notify={vi.fn()} />);
    expect(await screen.findByText("Belum ada grup tugas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Buat grup pertama" }));
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    groupsApi.listGroups.mockRejectedValueOnce(new Error("Daftar grup gagal"));
    rerender(<GroupsPage token="jwt-2" notify={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Daftar grup gagal");
  });

  it("menampilkan kesalahan saat penghapusan gagal", async () => {
    groupsApi.deleteGroup.mockRejectedValue(new Error("Grup gagal dihapus"));
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));
    render(<GroupsPage token="jwt" notify={vi.fn()} />);
    await screen.findByText("Proyek kampus");
    fireEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Grup gagal dihapus");
  });

  it("menampilkan grup pribadi tanpa deskripsi dan jumlah tugas", async () => {
    groupsApi.listGroups.mockResolvedValueOnce({
      groups: [
        { id: 1, title: "Satu", is_public: false },
        { id: 2, title: "Dua", is_public: true, description: "Catatan", todos: [] },
        { id: 3, title: "Tiga", is_public: false, todos: [{ id: 1 }] },
        { id: 4, title: "Empat", is_public: false },
        { id: 5, title: "Lima", is_public: false },
      ],
    });
    render(<GroupsPage token="jwt" notify={vi.fn()} />);
    expect(await screen.findByText("Satu")).toBeInTheDocument();
    expect(screen.getAllByText("Pribadi")).toHaveLength(4);
    expect(screen.getAllByText("Belum ada deskripsi untuk grup ini.")).toHaveLength(4);
    expect(screen.getAllByText("0 tugas")).toHaveLength(4);
    expect(screen.getByText("1 tugas")).toBeInTheDocument();
  });

  it("menganggap daftar grup bernilai kosong sebagai tanpa grup", async () => {
    groupsApi.listGroups.mockResolvedValueOnce({ groups: null });
    render(<GroupsPage token="jwt" notify={vi.fn()} />);
    expect(await screen.findByText("Belum ada grup tugas")).toBeInTheDocument();
  });
});
