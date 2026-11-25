import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import GroupModal from "./GroupModal.jsx";

describe("dialog grup", () => {
  afterEach(() => cleanup());

  it("membuat grup pribadi", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<GroupModal onSave={onSave} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nama grup"), { target: { value: "Pekerjaan" } });
    fireEvent.change(screen.getByLabelText("Deskripsi"), { target: { value: "Catatan pekerjaan" } });
    fireEvent.submit(screen.getByRole("button", { name: "Buat grup" }).closest("form"));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      title: "Pekerjaan", description: "Catatan pekerjaan", is_public: false,
    }));
  });

  it("memperbarui grup publik dan melaporkan kegagalan", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Grup tidak dapat disimpan"));
    render(<GroupModal group={{ title: "Lama", description: "Catatan", is_public: true }} onSave={onSave} onClose={vi.fn()} />);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Grup tidak dapat disimpan");
    expect(onSave).toHaveBeenCalledWith({ title: "Lama", description: "Catatan", is_public: false });
  });
});
