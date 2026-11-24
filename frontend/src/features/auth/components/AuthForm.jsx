import { useState } from "react";
import * as authApi from "../api/authApi.js";

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const registering = mode === "register";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    try {
      if (registering) {
        await authApi.register({ username, email, password });
        setMode("login");
        setPassword("");
        setNotice("Akun berhasil dibuat. Silakan masuk.");
      } else {
        onAuthenticated(await authApi.login({ username, password }));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  function changeMode() {
    setMode(registering ? "login" : "register");
    setError("");
    setNotice("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark brand-mark-large" aria-hidden="true">✓</div>
        <p className="eyebrow">RUANG KERJA YANG LEBIH TERATUR</p>
        <h1>{registering ? "Buat akun baru" : "Selamat datang kembali"}</h1>
        <p className="auth-description">
          {registering ? "Mulai atur prioritas dan capai tujuan Anda." : "Masuk untuk melanjutkan daftar tugas Anda."}
        </p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-username">Nama pengguna</label>
          <input
            id="auth-username"
            autoComplete="username"
            minLength={3}
            maxLength={255}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          {registering && (
            <>
              <label htmlFor="auth-email">Alamat email</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </>
          )}
          <label htmlFor="auth-password">Kata sandi</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={registering ? "new-password" : "current-password"}
            minLength={registering ? 6 : undefined}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className="form-message form-error" role="alert">{error}</p>}
          {notice && <p className="form-message form-success" role="status">{notice}</p>}
          <button className="button button-primary button-wide" type="submit" disabled={pending}>
            {pending ? "Mohon tunggu..." : registering ? "Daftar sekarang" : "Masuk ke akun"}
          </button>
        </form>
        <p className="auth-switch">
          {registering ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button type="button" onClick={changeMode}>{registering ? "Masuk" : "Daftar"}</button>
        </p>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-shape" aria-hidden="true" />
        <span className="aside-kicker">TODOLIST PRO</span>
        <h2>Fokus pada hal yang berarti.</h2>
        <p>Rencanakan hari ini, pantau progres, dan selesaikan tujuan satu per satu.</p>
        <div className="aside-quote">
          <span className="quote-check">✓</span>
          <span>Langkah kecil tetap membawa Anda maju.</span>
        </div>
      </aside>
    </main>
  );
}
