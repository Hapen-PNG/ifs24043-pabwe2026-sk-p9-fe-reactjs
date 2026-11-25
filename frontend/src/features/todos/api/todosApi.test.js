import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as todosApi from "./todosApi.js";

describe("API tugas", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { todos: [], stats: {}, todo: { id: 7 } } }),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("mengambil daftar dengan atau tanpa filter grup", async () => {
    await todosApi.listTodos("jwt");
    expect(fetch.mock.calls[0][0]).toMatch(/\/todos$/);
    await todosApi.listTodos("jwt", "Grup Proyek");
    expect(fetch.mock.calls[1][0]).toContain("todo_group_id=Grup%20Proyek");
  });

  it("menangani detail, pembuatan, perubahan, status, penghapusan, dan statistik", async () => {
    await todosApi.getTodo("jwt", 7);
    await todosApi.createTodo("jwt", { title: "Tugas" });
    await todosApi.updateTodo("jwt", 7, { title: "Baru" });
    await todosApi.updateTodoStatus("jwt", 7, "completed");
    await todosApi.deleteTodo("jwt", 7);
    await todosApi.getTodoStats("jwt");
    expect(fetch.mock.calls.map(([url, options]) => [url, options.method || "GET"])).toEqual([
      ["/api/todos/7", "GET"],
      ["/api/todos", "POST"],
      ["/api/todos/7", "PUT"],
      ["/api/todos/7/status", "PATCH"],
      ["/api/todos/7", "DELETE"],
      ["/api/todos/stats", "GET"],
    ]);
  });
});
