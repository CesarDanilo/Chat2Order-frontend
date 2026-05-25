// src/context/auth-context.tsx

import {
  createContext,
  useContext,
  useState,
} from "react";

// =========================
// TYPES
// =========================

type AuthContextType = {
  token: string | null;
  authenticated: boolean;

  signIn: (token: string) => void;
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
  // STATE
  // =========================

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // =========================
  // LOGIN
  // =========================

  function signIn(token: string) {

    localStorage.setItem("token", token);

    setToken(token);
  }

  // =========================
  // LOGOUT
  // =========================

  function signOut() {

    localStorage.removeItem("token");

    setToken(null);
  }

  // =========================
  // VALUES
  // =========================

  return (

    <AuthContext.Provider
      value={{
        token,
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