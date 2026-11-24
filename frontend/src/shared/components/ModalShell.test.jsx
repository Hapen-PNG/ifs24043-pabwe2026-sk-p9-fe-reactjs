import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ModalShell from "./ModalShell.jsx";

describe("kerangka dialog", () => {
  afterEach(() => cleanup());

  it("menampilkan konten dan menutup lewat tombol", () => {
    const onClose = vi.fn();
    render(<ModalShell title="Dialog uji" onClose={onClose}><p>Isi dialog</p></ModalShell>);
    expect(screen.getByRole("dialog", { name: "Dialog uji" })).toHaveTextContent("Isi dialog");
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup saat latar diklik, tetapi tidak saat panel diklik", () => {
    const onClose = vi.fn();
    const { container } = render(<ModalShell title="Lebar" onClose={onClose} wide><p>Isi</p></ModalShell>);
    expect(screen.getByRole("dialog")).toHaveClass("modal-panel-wide");
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(container.querySelector(".modal-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
