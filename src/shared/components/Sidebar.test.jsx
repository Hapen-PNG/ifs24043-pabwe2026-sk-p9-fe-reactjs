import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Sidebar from "./Sidebar.jsx";

describe("navigasi samping", () => {
  afterEach(() => cleanup());

  it("menampilkan navigasi anggota dan meneruskan pilihan menu", () => {
    const onNavigate = vi.fn();
    const onLogout = vi.fn();
    render(<Sidebar activeView="todos" user={{ username: "sari", role: "member" }} onNavigate={onNavigate} onLogout={onLogout} />);
    expect(screen.getByRole("button", { name: "Tugas saya" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button", { name: "Panel admin" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Grup tugas" }));
    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));
    expect(onNavigate).toHaveBeenCalledWith("groups");
    expect(onLogout).toHaveBeenCalled();
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("menambahkan navigasi admin untuk pengguna admin", () => {
    const onNavigate = vi.fn();
    render(<Sidebar activeView="admin" user={{ username: "admin", role: "admin" }} onNavigate={onNavigate} onLogout={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Panel admin" }));
    expect(onNavigate).toHaveBeenCalledWith("admin");
  });
});
