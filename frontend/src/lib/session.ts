// Sessão guardada no navegador (token e usuário) e aviso de sessão expirada.
// O AuthProvider e o roteador escutam `onSessionExpired` para limpar o estado e ir para /auth.

const TOKEN_KEY = "token";
const USER_KEY = "user";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  admin: boolean;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function storeUser(user: SessionUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Chamado quando a API responde 401. Várias requisições podem falhar juntas: só a primeira age.
let expiring = false;

export function expireSession() {
  if (expiring || !getStoredToken()) return;
  expiring = true;
  clearStoredSession();
  try {
    listeners.forEach((listener) => listener());
  } finally {
    expiring = false;
  }
}
