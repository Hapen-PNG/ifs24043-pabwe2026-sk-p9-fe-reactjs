const navigation = [
  { id: "dashboard", label: "Ringkasan", icon: "⌂" },
  { id: "todos", label: "Tugas saya", icon: "▣" },
  { id: "groups", label: "Grup tugas", icon: "▦" },
  { id: "templates", label: "Templat", icon: "◇" },
  { id: "ai", label: "Asisten AI", icon: "✦" },
];

export default function Sidebar({ activeView, user, onNavigate, onLogout }) {
  const items = user.role === "admin"
    ? [...navigation, { id: "admin", label: "Panel admin", icon: "⚙" }]
    : navigation;
  const initials = user.username.slice(0, 1).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">✓</span>
        <span>Todolist<span className="brand-light">Pro</span></span>
      </div>
      <p className="sidebar-caption">MENU UTAMA</p>
      <nav className="sidebar-nav" aria-label="Navigasi utama">
        {items.map((item) => (
          <button
            className={`nav-item${activeView === item.id ? " nav-item-active" : ""}`}
            key={item.id}
            type="button"
            aria-current={activeView === item.id ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span aria-hidden="true">✦</span>
          <strong>Satu hal pada satu waktu.</strong>
          <p>Fokus membantu Anda menyelesaikan lebih banyak.</p>
        </div>
        <div className="sidebar-user">
          <span className="avatar">{initials}</span>
          <span className="sidebar-user-name">
            <strong>{user.username}</strong>
            <small>{user.role === "admin" ? "Administrator" : "Anggota"}</small>
          </span>
          <button type="button" className="logout-button" onClick={onLogout} aria-label="Keluar">
            ↗
          </button>
        </div>
      </div>
    </aside>
  );
}
