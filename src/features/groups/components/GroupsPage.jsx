import { useEffect, useState } from "react";
import * as groupsApi from "../api/groupsApi.js";
import Loading from "../../../shared/components/Loading.jsx";
import GroupModal from "../modals/GroupModal.jsx";

export default function GroupsPage({ token, notify }) {
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await groupsApi.listGroups(token);
      setGroups(data.groups || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token]);

  async function saveGroup(payload) {
    if (editing) await groupsApi.updateGroup(token, editing.id, payload);
    else await groupsApi.createGroup(token, payload);
    setEditing(undefined);
    notify(editing ? "Grup berhasil diperbarui." : "Grup berhasil dibuat.");
    await load();
  }

  async function removeGroup(group) {
    if (!window.confirm(`Hapus grup “${group.title}” beserta tugas di dalamnya?`)) return;
    try {
      await groupsApi.deleteGroup(token, group.id);
      notify("Grup berhasil dihapus.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section>
      <div className="page-heading page-heading-row">
        <div>
          <p className="eyebrow">ORGANISASI</p>
          <h1>Grup tugas</h1>
          <p className="page-subtitle">Kelompokkan tugas berdasarkan proyek atau tujuan.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => setEditing(null)}>
          <span aria-hidden="true">＋</span> Grup baru
        </button>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {loading ? <Loading label="Memuat grup..." /> : groups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">▦</span>
          <h2>Belum ada grup tugas</h2>
          <p>Buat grup untuk merapikan tugas Anda.</p>
          <button className="button button-primary" type="button" onClick={() => setEditing(null)}>Buat grup pertama</button>
        </div>
      ) : (
        <div className="group-grid">
          {groups.map((group, index) => (
            <article className="group-card" key={group.id}>
              <div className={`group-card-art group-art-${index % 4}`} aria-hidden="true">
                <span>{["◈", "◉", "◇", "▧"][index % 4]}</span>
              </div>
              <div className="group-card-body">
                <div className="group-card-title">
                  <div>
                    <h2>{group.title}</h2>
                    <span className="muted-text">{group.todos?.length || 0} tugas</span>
                  </div>
                  <span className={`visibility-pill${group.is_public ? " visibility-public" : ""}`}>
                    {group.is_public ? "Publik" : "Pribadi"}
                  </span>
                </div>
                <p>{group.description || "Belum ada deskripsi untuk grup ini."}</p>
                <div className="group-card-actions">
                  <button className="button button-quiet button-small" type="button" onClick={() => setEditing(group)}>Ubah</button>
                  <button className="button button-danger-quiet button-small" type="button" onClick={() => void removeGroup(group)}>Hapus</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing !== undefined && (
        <GroupModal group={editing} onSave={saveGroup} onClose={() => setEditing(undefined)} />
      )}
    </section>
  );
}
