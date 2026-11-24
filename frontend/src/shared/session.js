const storageKey = "todolist-pro-session";

export function loadSession() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (!session.token || !session.user) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(storageKey);
}
