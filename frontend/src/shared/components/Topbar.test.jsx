import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Topbar from "./Topbar.jsx";

describe("bilah atas", () => {
  afterEach(() => cleanup());

  it("menampilkan tanggal, judul halaman, dan membuka profil", () => {
    const onProfile = vi.fn();
    render(<Topbar activeView="todos" user={{ username: "dina", role: "member" }} onProfile={onProfile} />);
    expect(screen.getByRole("heading", { name: "Tugas saya" })).toBeInTheDocument();
    expect(screen.getByText("Selamat beraktivitas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pengaturan profil" }));
    expect(onProfile).toHaveBeenCalled();
  });

  it("menggunakan judul ringkasan saat halaman tidak dikenal dan menampilkan label admin", () => {
    render(<Topbar activeView="tidak-ada" user={{ username: "admin", role: "admin" }} onProfile={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Ringkasan" })).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });
});
