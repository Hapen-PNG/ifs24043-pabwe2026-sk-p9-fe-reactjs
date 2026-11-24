import { useEffect, useMemo, useState } from "react";
import * as todosApi from "../api/todosApi.js";
import * as groupsApi from "../../groups/api/groupsApi.js";
import Loading from "../../../shared/components/Loading.jsx";
import TodoModal from "../modals/TodoModal.jsx";

const statusNames = {
  pending: "Belum dimulai",
  in_progress: "Sedang dikerjakan",
  completed: "Selesai",
};

function displayDate(value) {
  if (!value) return "Tanpa tenggat";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

export default function TodosPage({ token, notify }) {
  const [todos, setTodos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("");
  const [modalTodo, setModalTodo] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [todoData, groupData] = await Promise.all([
        todosApi.listTodos(token, groupFilter || undefined),
        groupsApi.listGroups(token),
      ]);
      setTodos(todoData.todos || []);
      setGroups(groupData.groups || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token, groupFilter]);

  const visibleTodos = useMemo(() => todos.filter((todo) => {
    const matchesText = `${todo.title} ${todo.description || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (statusFilter === "all" || todo.status === statusFilter);
  }), [todos, query, statusFilter]);

  async function saveTodo(payload) {
    if (modalTodo) await todosApi.updateTodo(token, modalTodo.id, payload);
    else await todosApi.createTodo(token, payload);
    setModalTodo(undefined);
    notify(modalTodo ? "Tugas berhasil diperbarui." : "Tugas berhasil dibuat.");
    await load();
  }

  async function removeTodo(todo) {
    if (!window.confirm(`Hapus tugas “${todo.title}”?`)) return;
    try {
      await todosApi.deleteTodo(token, todo.id);
      notify("Tugas berhasil dihapus.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function toggleStatus(todo) {
    const status = todo.status === "completed" ? "pending" : "completed";
    try {
      await todosApi.updateTodoStatus(token, todo.id, status);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section>
      <div className="page-heading page-heading-row">
        <div>
          <p className="eyebrow">RUANG KERJA</p>
          <h1>Tugas saya</h1>
          <p className="page-subtitle">Atur prioritas dan pantau setiap langkah.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => setModalTodo(null)}>
          <span aria-hidden="true">＋</span> Tugas baru
        </button>
      </div>
      <div className="filter-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Cari tugas" placeholder="Cari tugas..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select aria-label="Filter status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Semua status</option>
          <option value="pending">Belum dimulai</option>
          <option value="in_progress">Sedang dikerjakan</option>
          <option value="completed">Selesai</option>
        </select>
        <select aria-label="Filter grup" value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
          <option value="">Semua grup</option>
          {groups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
        </select>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {loading ? <Loading label="Memuat tugas..." /> : visibleTodos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">▣</span>
          <h2>{query || groupFilter || statusFilter !== "all" ? "Tugas tidak ditemukan" : "Belum ada tugas"}</h2>
          <p>{query || groupFilter || statusFilter !== "all" ? "Coba ubah kata kunci atau filter." : "Tambahkan tugas pertama untuk memulai."}</p>
          {!query && !groupFilter && statusFilter === "all" && (
            <button className="button button-primary" type="button" onClick={() => setModalTodo(null)}>Buat tugas</button>
          )}
        </div>
      ) : (
        <div className="todo-list">
          {visibleTodos.map((todo) => (
            <article className={`todo-card${todo.status === "completed" ? " todo-card-complete" : ""}`} key={todo.id}>
              <button
                type="button"
                className={`todo-check${todo.status === "completed" ? " todo-check-done" : ""}`}
                aria-label={todo.status === "completed" ? "Tandai belum selesai" : "Tandai selesai"}
                onClick={() => void toggleStatus(todo)}
              >
                {todo.status === "completed" ? "✓" : ""}
              </button>
              <div className="todo-card-content">
                <h2>{todo.title}</h2>
                {todo.description && <p>{todo.description}</p>}
                <div className="todo-meta">
                  <span className={`status-pill status-${todo.status}`}>{statusNames[todo.status] || todo.status}</span>
                  {todo.due_date && <span className="todo-date">◷ {displayDate(todo.due_date)}</span>}
                  {todo.group?.title && <span className="group-chip">{todo.group.title}</span>}
                </div>
              </div>
              <div className="todo-card-actions">
                <button className="icon-button" type="button" aria-label={`Ubah ${todo.title}`} onClick={() => setModalTodo(todo)}>✎</button>
                <button className="icon-button danger-icon" type="button" aria-label={`Hapus ${todo.title}`} onClick={() => void removeTodo(todo)}>⌫</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {modalTodo !== undefined && (
        <TodoModal todo={modalTodo} groups={groups} onSave={saveTodo} onClose={() => setModalTodo(undefined)} />
      )}
    </section>
  );
}

export { displayDate, statusNames };
