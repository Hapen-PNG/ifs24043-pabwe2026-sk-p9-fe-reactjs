import { useEffect, useState } from "react";
import * as adminApi from "../api/adminApi.js";
import Loading from "../../../shared/components/Loading.jsx";

export default function AdminPage({ token }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userTodos, setUserTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminApi.listUsers(token)
      .then((data) => { if (active) setUsers(data.users || []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function showUser(summary) {
    setSelected(summary);
    setDetailLoading(true);
    setError("");
    try {
      const data = await adminApi.listUserTodos(token, summary.user.id);
      setUserTodos(data.todos || []);
    } catch (requestError) {
      setError(requestError.message);
      setUserTodos([]);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">PENGELOLAAN</p>
        <h1>Panel admin</h1>
        <p className="page-subtitle">Pantau anggota dan aktivitas tugas di Todolist Pro.</p>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {loading ? <Loading label="Memuat anggota..." /> : (
        <div className="admin-layout">
          <div className="panel-card">
            <div className="panel-heading">
              <div><h2>Anggota</h2><p>{users.length} akun terdaftar</p></div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Pengguna</th><th>Peran</th><th>Total tugas</th><th>Selesai</th></tr>
                </thead>
                <tbody>
                  {users.map((summary) => (
                    <tr key={summary.user.id} className={selected?.user.id === summary.user.id ? "row-selected" : ""}>
                      <td>
                        <button className="table-user" type="button" onClick={() => void showUser(summary)}>
                          <span className="avatar avatar-small">{summary.user.username.slice(0, 1).toUpperCase()}</span>
                          <span><strong>{summary.user.username}</strong><small>{summary.user.email}</small></span>
                        </button>
                      </td>
                      <td><span className={`role-pill${summary.user.role === "admin" ? " role-admin" : ""}`}>{summary.user.role === "admin" ? "Admin" : "Anggota"}</span></td>
                      <td>{summary.stats.total}</td>
                      <td>{summary.stats.total_selesai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="table-empty">Belum ada akun.</div>}
            </div>
          </div>
          <aside className="panel-card admin-detail">
            <div className="panel-heading">
              <div><h2>Tugas anggota</h2><p>{selected ? selected.user.username : "Pilih anggota untuk melihat tugas"}</p></div>
            </div>
            {!selected ? <div className="admin-placeholder">Daftar tugas akan ditampilkan setelah Anda memilih anggota.</div>
              : detailLoading ? <Loading label="Memuat tugas anggota..." />
                : userTodos.length === 0 ? <div className="admin-placeholder">Anggota ini belum memiliki tugas.</div>
                  : <div className="admin-todo-list">{userTodos.map((todo) => (
                    <article key={todo.id}>
                      <span className={`status-dot status-${todo.status}`} />
                      <span><strong>{todo.title}</strong><small>{todo.status === "completed" ? "Selesai" : todo.status === "in_progress" ? "Sedang dikerjakan" : "Belum dimulai"}</small></span>
                    </article>
                  ))}</div>}
          </aside>
        </div>
      )}
    </section>
  );
}
