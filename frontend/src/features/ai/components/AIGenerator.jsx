import { useState } from "react";
import * as aiApi from "../api/aiApi.js";
import * as todosApi from "../../todos/api/todosApi.js";

export default function AIGenerator({ token, notify }) {
  const [task, setTask] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [creating, setCreating] = useState(false);

  async function generate(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSubtasks([]);
    try {
      const data = await aiApi.generateSubtasks(token, task);
      setSubtasks(data.subtasks || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function createTodos() {
    setCreating(true);
    setError("");
    try {
      await Promise.all(subtasks.map((title) => todosApi.createTodo(token, {
        title,
        description: `Subtugas dari: ${task}`,
        due_date: "",
        group_id: null,
      })));
      notify(`${subtasks.length} tugas berhasil ditambahkan.`);
      setSubtasks([]);
      setTask("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">TEMAN BERPIKIR</p>
        <h1>Asisten AI</h1>
        <p className="page-subtitle">Ubah pekerjaan besar menjadi langkah-langkah yang lebih mudah dikerjakan.</p>
      </div>
      <div className="ai-layout">
        <form className="ai-prompt-card" onSubmit={generate}>
          <div className="ai-sparkle" aria-hidden="true">✦</div>
          <h2>Apa yang ingin Anda selesaikan?</h2>
          <p>Jelaskan tugas atau tujuan Anda dengan singkat.</p>
          <label htmlFor="ai-task">Tugas utama</label>
          <textarea
            id="ai-task"
            rows="6"
            minLength={3}
            maxLength={2000}
            required
            placeholder="Contoh: Menyiapkan presentasi untuk rapat mingguan..."
            value={task}
            onChange={(event) => setTask(event.target.value)}
          />
          {error && <p className="form-message form-error" role="alert">{error}</p>}
          <button className="button button-primary button-wide" type="submit" disabled={pending}>
            {pending ? "Sedang menyusun..." : "✦ Buat subtugas"}
          </button>
          <p className="ai-privacy">Hasil dibuat dengan AI dan dapat Anda ubah kapan saja.</p>
        </form>
        <div className="ai-result-card">
          <div className="ai-result-heading">
            <div>
              <p className="eyebrow">RENCANA KERJA</p>
              <h2>Langkah berikutnya</h2>
            </div>
            {subtasks.length > 0 && <span className="result-count">{subtasks.length} langkah</span>}
          </div>
          {subtasks.length === 0 ? (
            <div className="ai-empty">
              <span aria-hidden="true">✧</span>
              <p>Subtugas yang disarankan akan muncul di sini.</p>
            </div>
          ) : (
            <>
              <ol className="ai-subtask-list">
                {subtasks.map((subtask, index) => (
                  <li key={`${index}-${subtask}`}>
                    <span className="ai-step-number">{String(index + 1).padStart(2, "0")}</span>
                    <span>{subtask}</span>
                  </li>
                ))}
              </ol>
              <button className="button button-dark button-wide" type="button" disabled={creating} onClick={() => void createTodos()}>
                {creating ? "Menambahkan tugas..." : "Tambahkan semua ke daftar tugas"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
