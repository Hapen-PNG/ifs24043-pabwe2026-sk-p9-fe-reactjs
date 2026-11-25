import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthForm from "./AuthForm.jsx";
import * as authApi from "../api/authApi.js";

vi.mock("../api/authApi.js", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

describe("formulir autentikasi", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it("masuk dan mengirim hasil autentikasi ke aplikasi", async () => {
    const user = userEvent.setup();
    const onAuthenticated = vi.fn();
    authApi.login.mockResolvedValue({ token: "jwt", user: { id: 2, username: "sari" } });
    render(<AuthForm onAuthenticated={onAuthenticated} />);
    await user.type(screen.getByLabelText("Nama pengguna"), "sari");
    await user.type(screen.getByLabelText("Kata sandi"), "rahasia");
    await user.click(screen.getByRole("button", { name: "Masuk ke akun" }));
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith({ token: "jwt", user: { id: 2, username: "sari" } }));
    expect(authApi.login).toHaveBeenCalledWith({ username: "sari", password: "rahasia" });
  });

  it("menampilkan pesan kesalahan saat masuk gagal", async () => {
    authApi.login.mockRejectedValue(new Error("Kredensial tidak sesuai"));
    render(<AuthForm onAuthenticated={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nama pengguna"), { target: { value: "sari" } });
    fireEvent.change(screen.getByLabelText("Kata sandi"), { target: { value: "salah" } });
    fireEvent.submit(screen.getByRole("button", { name: "Masuk ke akun" }).closest("form"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Kredensial tidak sesuai");
  });

  it("mendaftarkan akun lalu mengarahkan pengguna ke formulir masuk", async () => {
    const user = userEvent.setup();
    authApi.register.mockResolvedValue({ user: { id: 4 } });
    render(<AuthForm onAuthenticated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Daftar" }));
    expect(screen.getByLabelText("Alamat email")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Nama pengguna"), "bima");
    await user.type(screen.getByLabelText("Alamat email"), "bima@example.com");
    await user.type(screen.getByLabelText("Kata sandi"), "rahasia");
    await user.click(screen.getByRole("button", { name: "Daftar sekarang" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Akun berhasil dibuat");
    expect(screen.getByRole("heading", { name: "Selamat datang kembali" })).toBeInTheDocument();
    expect(authApi.register).toHaveBeenCalledWith({
      username: "bima",
      email: "bima@example.com",
      password: "rahasia",
    });
  });

  it("menampilkan kesalahan pendaftaran dan dapat kembali ke mode daftar", async () => {
    const user = userEvent.setup();
    authApi.register.mockRejectedValue(new Error("Email telah digunakan"));
    render(<AuthForm onAuthenticated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Daftar" }));
    await user.type(screen.getByLabelText("Nama pengguna"), "bima");
    await user.type(screen.getByLabelText("Alamat email"), "bima@example.com");
    await user.type(screen.getByLabelText("Kata sandi"), "rahasia");
    await user.click(screen.getByRole("button", { name: "Daftar sekarang" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email telah digunakan");
    await user.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByRole("heading", { name: "Selamat datang kembali" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
