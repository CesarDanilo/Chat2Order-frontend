import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "@/lib/query-client";
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  onSessionExpired,
  storeSession,
  storeUser,
  type SessionUser,
} from "@/lib/session";
import { logoutService } from "@/services/auth-services";

type AuthContextType = {
  token: string | null;
  user: SessionUser | null;
  authenticated: boolean;
  signIn: (token: string, user: SessionUser) => void;
  signOut: () => void;
  // Atualiza o usuário guardado (ex.: nome alterado no perfil).
  updateUser: (user: SessionUser) => void;
};

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<SessionUser | null>(getStoredUser);

  // 401 em qualquer requisição: a sessão já foi apagada do navegador; aqui limpa o estado e o cache.
  useEffect(
    () =>
      onSessionExpired(() => {
        setToken(null);
        setUser(null);
        queryClient.clear();
      }),
    [],
  );

  function signIn(nextToken: string, nextUser: SessionUser) {
    storeSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }

  function signOut() {
    if (getStoredToken()) logoutService().catch(() => undefined);
    clearStoredSession();
    queryClient.clear();
    setToken(null);
    setUser(null);
  }

  function updateUser(nextUser: SessionUser) {
    storeUser(nextUser);
    setUser(nextUser);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, authenticated: !!token, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
