import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TemplatesPage from "./TemplatesPage.jsx";
import * as templatesApi from "../api/templatesApi.js";

vi.mock("../api/templatesApi.js", () => ({
  listTemplates: vi.fn(),
  cloneTemplate: vi.fn(),
}));

describe("halaman templat publik", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    templatesApi.listTemplates.mockResolvedValue({
      templates: [{ id: 3, title: "Persiapan ujian", description: "Rencana belajar", todos: [{ id: 1, title: "Susun materi" }] }],
    });
    templatesApi.cloneTemplate.mockResolvedValue({ group: { id: 8 } });
  });
  afterEach(() => cleanup());

  it("menampilkan templat dan menyalinnya ke akun pengguna", async () => {
    const notify = vi.fn();
    render(<TemplatesPage token="jwt" notify={notify} onNavigate={vi.fn()} />);
    expect(await screen.findByText("Persiapan ujian")).toBeInTheDocument();
    expect(screen.getByText("Susun materi")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salin templat" }));
    await waitFor(() => expect(templatesApi.cloneTemplate).toHaveBeenCalledWith("jwt", 3));
    expect(notify).toHaveBeenCalledWith('Templat “Persiapan ujian” berhasil disalin ke grup Anda.');
  });

  it("menampilkan keadaan kosong dan berpindah ke grup", async () => {
    const onNavigate = vi.fn();
    templatesApi.listTemplates.mockResolvedValue({ templates: null });
    render(<TemplatesPage token="jwt" notify={vi.fn()} onNavigate={onNavigate} />);
    fireEvent.click(await screen.findByRole("button", { name: "Kelola grup saya" }));
    expect(onNavigate).toHaveBeenCalledWith("groups");
  });

  it("menampilkan nilai pengganti saat deskripsi dan daftar langkah tidak tersedia", async () => {
    templatesApi.listTemplates.mockResolvedValue({
      templates: [{ id: 12, title: "Rencana sederhana" }],
    });
    render(<TemplatesPage token="jwt" notify={vi.fn()} onNavigate={vi.fn()} />);
    expect(await screen.findByText("Rencana sederhana")).toBeInTheDocument();
    expect(screen.getByText("Alur kerja siap digunakan untuk membantu Anda memulai.")).toBeInTheDocument();
    expect(screen.getByText("0 langkah")).toBeInTheDocument();
  });

  it("menampilkan pesan jika templat gagal dimuat atau disalin", async () => {
    templatesApi.listTemplates.mockRejectedValueOnce(new Error("Templat gagal dimuat"));
    const firstRender = render(<TemplatesPage token="jwt" notify={vi.fn()} onNavigate={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Templat gagal dimuat");
    firstRender.unmount();
    templatesApi.listTemplates.mockResolvedValueOnce({
      templates: [{ id: 9, title: "Rencana", todos: [] }],
    });
    templatesApi.cloneTemplate.mockRejectedValueOnce(new Error("Salin gagal"));
    render(<TemplatesPage token="jwt-2" notify={vi.fn()} onNavigate={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Salin templat" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Salin gagal");
  });
});
