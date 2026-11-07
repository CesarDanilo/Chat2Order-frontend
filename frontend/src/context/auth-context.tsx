// src/context/auth-context.tsx

import {
  createContext,
  useContext,
  useState,
} from "react";

// =========================
// USER TYPE
// =========================

type User = {
  id: string;
  name: string;
  email: string;
  admin: boolean;
};

// =========================
// CONTEXT TYPE
// =========================

type AuthContextType = {
  token: string | null;

  user: User | null;

  authenticated: boolean;

  signIn: (
    token: string,
    user: User
  ) => void;

  signOut: () => void;
};

// =========================
// CONTEXT
// =========================

const AuthContext = createContext(
  {} as AuthContextType
);

// =========================
// PROVIDER
// =========================

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {

  // =========================
  // TOKEN
  // =========================

  const [token, setToken] =
    useState<string | null>(
      localStorage.getItem("token")
    );

  // =========================
  // USER
  // =========================

  const [user, setUser] =
    useState<User | null>(() => {
      try {
        const storage =
          localStorage.getItem("user");

        return storage
          ? JSON.parse(storage)
          : null;

      } catch {
        return null;
      }
    });

  // =========================
  // LOGIN
  // =========================

  function signIn(
    token: string,
    user: User
  ) {

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setToken(token);

    setUser(user);
  }

  // =========================
  // LOGOUT
  // =========================

  function signOut() {
    const current = localStorage.getItem("token");

    // Encerra a sessão também no servidor. Sem rede, o token só expira no prazo normal.
    if (current) {
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${current}` },
      }).catch(() => undefined);
    }

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken(null);

    setUser(null);
  }

  // =========================
  // VALUES
  // =========================

  return (

    <AuthContext.Provider
      value={{
        token,
        user,
        authenticated: !!token,
        signIn,
        signOut,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}

// =========================
// HOOK
// =========================

export function useAuth() {
  return useContext(AuthContext);
}