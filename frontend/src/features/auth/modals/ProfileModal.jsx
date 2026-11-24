import { useState } from "react";
import * as authApi from "../api/authApi.js";
import ModalShell from "../../../shared/components/ModalShell.jsx";

export default function ProfileModal({ token, user, onClose, onUpdated }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await authApi.updateProfile(token, { username, email });
      onUpdated(result.user);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <ModalShell title="Pengaturan profil" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <label htmlFor="profile-username">Nama pengguna</label>
        <input id="profile-username" required minLength={3} value={username} onChange={(event) => setUsername(event.target.value)} />
        <label htmlFor="profile-email">Alamat email</label>
        <input id="profile-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        {error && <p className="form-message form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>Batal</button>
          <button className="button button-primary" type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
