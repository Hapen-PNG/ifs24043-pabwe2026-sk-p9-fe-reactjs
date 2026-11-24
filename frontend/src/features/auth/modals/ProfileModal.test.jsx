import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileModal from "./ProfileModal.jsx";
import * as authApi from "../api/authApi.js";

vi.mock("../api/authApi.js", () => ({ updateProfile: vi.fn() }));

describe("dialog profil", () => {
  const props = {
    token: "jwt",
    user: { username: "lina", email: "lina@example.com" },
    onClose: vi.fn(),
    onUpdated: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => cleanup());

  it("menyimpan perubahan profil", async () => {
    const user = userEvent.setup();
    const updatedUser = { username: "lina-baru", email: "baru@example.com" };
    authApi.updateProfile.mockResolvedValue({ user: updatedUser });
    render(<ProfileModal {...props} />);
    await user.clear(screen.getByLabelText("Nama pengguna"));
    await user.type(screen.getByLabelText("Nama pengguna"), updatedUser.username);
    await user.clear(screen.getByLabelText("Alamat email"));
    await user.type(screen.getByLabelText("Alamat email"), updatedUser.email);
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(props.onUpdated).toHaveBeenCalledWith(updatedUser));
    expect(props.onClose).toHaveBeenCalled();
  });

  it("menampilkan kesalahan dan membatalkan", async () => {
    authApi.updateProfile.mockRejectedValue(new Error("Profil tidak dapat diubah"));
    render(<ProfileModal {...props} />);
    fireEvent.submit(screen.getByRole("button", { name: "Simpan perubahan" }).closest("form"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Profil tidak dapat diubah");
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(props.onClose).toHaveBeenCalled();
  });
});
