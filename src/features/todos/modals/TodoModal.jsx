import { useState } from "react";
import ModalShell from "../../../shared/components/ModalShell.jsx";

export default function TodoModal({ todo, groups, onSave, onClose }) {
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [status, setStatus] = useState(todo?.status || "pending");
  const [dueDate, setDueDate] = useState(todo?.due_date?.slice(0, 10) || "");
  const [groupId, setGroupId] = useState(todo?.group_id ? String(todo.group_id) : "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await onSave({
        title,
        description,
        status,
        due_date: dueDate,
        group_id: groupId ? Number(groupId) : null,
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <ModalShell title={todo ? "Ubah tugas" : "Tugas baru"} onClose={onClose} wide>
      <form className="modal-form" onSubmit={submit}>
        <label htmlFor="todo-title">Judul tugas</label>
        <input id="todo-title" maxLength={255} required value={title} onChange={(event) => setTitle(event.target.value)} />
        <label htmlFor="todo-description">Deskripsi</label>
        <textarea id="todo-description" rows="4" value={description} onChange={(event) => setDescription(event.target.value)} />
        <div className="form-grid">
          <div>
            <label htmlFor="todo-date">Tenggat waktu</label>
            <input id="todo-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <div>
            <label htmlFor="todo-group">Grup tugas</label>
            <select id="todo-group" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              <option value="">Tanpa grup</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.title}</option>)}
            </select>
          </div>
        </div>
        {todo && (
          <>
            <label htmlFor="todo-status">Status</label>
            <select id="todo-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="pending">Belum dimulai</option>
              <option value="in_progress">Sedang dikerjakan</option>
              <option value="completed">Selesai</option>
            </select>
          </>
        )}
        {error && <p className="form-message form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>Batal</button>
          <button className="button button-primary" type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : todo ? "Simpan perubahan" : "Buat tugas"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
