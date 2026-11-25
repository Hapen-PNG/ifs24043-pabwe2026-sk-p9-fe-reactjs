const titles = {
  dashboard: "Ringkasan",
  todos: "Tugas saya",
  groups: "Grup tugas",
  templates: "Templat komunitas",
  ai: "Asisten AI",
  admin: "Panel admin",
};

export default function Topbar({ activeView, user, onProfile }) {
  const date = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="topbar">
      <div>
        <p className="topbar-date">{date}</p>
        <h2>{titles[activeView] || titles.dashboard}</h2>
      </div>
      <div className="topbar-actions">
        <span className="topbar-greeting">Selamat beraktivitas</span>
        <button className="profile-button" type="button" onClick={onProfile} aria-label="Pengaturan profil">
          <span className="avatar">{user.username.slice(0, 1).toUpperCase()}</span>
          <span className="profile-button-name"><strong>{user.username}</strong><small>{user.role === "admin" ? "Administrator" : "Anggota"}</small></span>
          <span className="profile-chevron" aria-hidden="true">⌄</span>
        </button>
      </div>
    </header>
  );
}
