import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Toast from "./Toast.jsx";

describe("notifikasi", () => {
  afterEach(() => cleanup());

  it("tidak membuat elemen saat pesan kosong", () => {
    const { container } = render(<Toast message="" onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("menampilkan pesan dan menangani tombol tutup", () => {
    const onClose = vi.fn();
    render(<Toast message="Tersimpan" onClose={onClose} />);
    expect(screen.getByRole("status")).toHaveTextContent("Tersimpan");
    fireEvent.click(screen.getByRole("button", { name: "Tutup notifikasi" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("menerapkan gaya notifikasi gagal", () => {
    render(<Toast message="Gagal" type="error" onClose={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveClass("toast-error");
  });
});
