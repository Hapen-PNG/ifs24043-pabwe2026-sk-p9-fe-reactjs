import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Loading from "./Loading.jsx";

describe("indikator pemuatan", () => {
  afterEach(() => cleanup());

  it("menampilkan label bawaan dan label yang diberikan", () => {
    const { rerender } = render(<Loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat data...");
    rerender(<Loading label="Memuat tugas..." />);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat tugas...");
  });
});
