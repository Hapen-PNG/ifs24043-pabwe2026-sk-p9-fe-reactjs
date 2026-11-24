import { useState } from "react";
import ModalShell from "../../../shared/components/ModalShell.jsx";

export default function GroupModal({ group, onSave, onClose }) {
  const [title, setTitle] = useState(group?.title || "");
  const [description, setDescription] = useState(group?.description || "");
  const [isPublic, setIsPublic] = useState(Boolean(group?.is_public));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await onSave({ title, description, is_public: isPublic });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <ModalShell title={group ? "Ubah grup tugas" : "Grup baru"} onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <label htmlFor="group-title">Nama grup</label>
        <input id="group-title" maxLength={255} required value={title} onChange={(event) => setTitle(event.target.value)} />
        <label htmlFor="group-description">Deskripsi</label>
        <textarea id="group-description" rows="4" value={description} onChange={(event) => setDescription(event.target.value)} />
        <label className="checkbox-row" htmlFor="group-public">
          <input id="group-public" type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
          <span>
            <strong>Jadikan templat publik</strong>
            <small>Pengguna lain dapat melihat dan menyalin grup ini.</small>
          </span>
        </label>
        {error && <p className="form-message form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>Batal</button>
          <button className="button button-primary" type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : group ? "Simpan perubahan" : "Buat grup"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
