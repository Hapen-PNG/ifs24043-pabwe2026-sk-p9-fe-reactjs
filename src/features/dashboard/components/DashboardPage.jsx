import { useEffect, useState } from "react";
import * as todosApi from "../../todos/api/todosApi.js";
import * as groupsApi from "../../groups/api/groupsApi.js";
import Loading from "../../../shared/components/Loading.jsx";

export default function DashboardPage({ token, user, onNavigate }) {
  const [stats, setStats] = useState({ total: 0, total_selesai: 0, belum_selesai: 0 });
  const [todos, setTodos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([todosApi.getTodoStats(token), todosApi.listTodos(token), groupsApi.listGroups(token)])
      .then(([statsData, todoData, groupData]) => {
        if (!active) return;
        setStats(statsData.stats || { total: 0, total_selesai: 0, belum_selesai: 0 });
        setTodos(todoData.todos || []);
        setGroups(groupData.groups || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const recentTodos = todos.slice(0, 4);
  const greetingName = user.username;

  return (
    <section>
      <div className="welcome-banner">
        <div className="welcome-copy">
          <p className="eyebrow">HARI YANG PRODUKTIF DIMULAI DI SINI</p>
          <h1>Halo, {greetingName} <span aria-hidden="true">✦</span></h1>
          <p>Ambil satu langkah kecil hari ini. Anda pasti bisa.</p>
          <button className="button button-light" type="button" onClick={() => onNavigate("todos")}>Lihat tugas saya <span aria-hidden="true">→</span></button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-card art-card-back" />
          <div className="art-card art-card-front"><span>✓</span><i /><i /><i /></div>
          <div className="art-star">✦</div>
        </div>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {loading ? <Loading label="Menyiapkan ringkasan..." /> : (
        <>
          <div className="stats-grid">
            <article className="stat-card stat-card-lavender">
              <span className="stat-icon">▣</span><span className="stat-label">Total tugas</span>
              <strong>{stats.total}</strong><small>Semua tugas yang tercatat</small>
            </article>
            <article className="stat-card stat-card-mint">
              <span className="stat-icon">✓</span><span className="stat-label">Tugas selesai</span>
              <strong>{stats.total_selesai}</strong><small>Progres yang sudah dicapai</small>
            </article>
            <article className="stat-card stat-card-peach">
              <span className="stat-icon">◷</span><span className="stat-label">Belum selesai</span>
              <strong>{stats.belum_selesai}</strong><small>Langkah berikutnya menanti</small>
            </article>
            <article className="stat-card stat-card-blue">
              <span className="stat-icon">▦</span><span className="stat-label">Grup tugas</span>
              <strong>{groups.length}</strong><small>Ruang kerja yang Anda buat</small>
            </article>
          </div>
          <div className="dashboard-lower">
            <section className="panel-card recent-panel">
              <div className="panel-heading">
                <div><h2>Tugas terbaru</h2><p>Terus bergerak, sedikit demi sedikit.</p></div>
                <button className="text-button" type="button" onClick={() => onNavigate("todos")}>Lihat semua <span aria-hidden="true">→</span></button>
              </div>
              {recentTodos.length === 0 ? (
                <div className="recent-empty"><span aria-hidden="true">✧</span><p>Belum ada tugas. Tambahkan langkah pertama Anda.</p></div>
              ) : recentTodos.map((todo) => (
                <article className="recent-todo" key={todo.id}>
                  <span className={`status-dot status-${todo.status}`} />
                  <span className="recent-todo-title"><strong>{todo.title}</strong><small>{todo.group?.title || "Tanpa grup"}</small></span>
                  <span className={`status-pill status-${todo.status}`}>
                    {todo.status === "completed" ? "Selesai" : todo.status === "in_progress" ? "Berjalan" : "Menunggu"}
                  </span>
                </article>
              ))}
            </section>
            <aside className="focus-card">
              <div className="focus-icon" aria-hidden="true">✦</div>
              <p className="eyebrow">PENGINGAT HARI INI</p>
              <h2>Progres lebih penting daripada kesempurnaan.</h2>
              <p>Pilih prioritas, kerjakan dengan tenang, dan rayakan setiap kemajuan.</p>
              <button className="button button-dark" type="button" onClick={() => onNavigate("ai")}>Buat rencana dengan AI</button>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
