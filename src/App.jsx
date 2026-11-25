import { useEffect, useState } from "react";
import AuthForm from "./features/auth/components/AuthForm.jsx";
import ProfileModal from "./features/auth/modals/ProfileModal.jsx";
import DashboardPage from "./features/dashboard/components/DashboardPage.jsx";
import TodosPage from "./features/todos/components/TodosPage.jsx";
import GroupsPage from "./features/groups/components/GroupsPage.jsx";
import TemplatesPage from "./features/templates/components/TemplatesPage.jsx";
import AIGenerator from "./features/ai/components/AIGenerator.jsx";
import AdminPage from "./features/admin/components/AdminPage.jsx";
import * as authApi from "./features/auth/api/authApi.js";
import Sidebar from "./shared/components/Sidebar.jsx";
import Topbar from "./shared/components/Topbar.jsx";
import Toast from "./shared/components/Toast.jsx";
import { clearSession, loadSession, saveSession } from "./shared/session.js";

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [activeView, setActiveView] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = "success") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function authenticate(value) {
    const nextSession = { token: value.token, user: value.user };
    saveSession(nextSession);
    setSession(nextSession);
    setActiveView("dashboard");
  }

  function updateUser(user) {
    const nextSession = { ...session, user };
    saveSession(nextSession);
    setSession(nextSession);
    notify("Profil berhasil diperbarui.");
  }

  async function signOut() {
    try {
      await authApi.logout(session.token);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      clearSession();
      setSession(null);
      setProfileOpen(false);
    }
  }

  if (!session) return <><AuthForm onAuthenticated={authenticate} /><Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} /></>;

  const pages = {
    dashboard: <DashboardPage token={session.token} user={session.user} onNavigate={setActiveView} />,
    todos: <TodosPage token={session.token} notify={notify} />,
    groups: <GroupsPage token={session.token} notify={notify} />,
    templates: <TemplatesPage token={session.token} notify={notify} onNavigate={setActiveView} />,
    ai: <AIGenerator token={session.token} notify={notify} />,
    admin: session.user.role === "admin" ? <AdminPage token={session.token} /> : null,
  };
  const content = pages[activeView] || pages.dashboard;

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} user={session.user} onNavigate={setActiveView} onLogout={() => void signOut()} />
      <div className="app-main">
        <Topbar activeView={activeView} user={session.user} onProfile={() => setProfileOpen(true)} />
        <main className="page-content">{content}</main>
      </div>
      {profileOpen && (
        <ProfileModal
          token={session.token}
          user={session.user}
          onClose={() => setProfileOpen(false)}
          onUpdated={updateUser}
        />
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
