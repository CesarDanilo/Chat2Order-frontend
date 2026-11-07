import { createFileRoute } from "@tanstack/react-router";

import { Login } from "@/pages/login";

type AuthSearch = {
  // Presente quando a sessão expirou (401): a tela mostra o aviso.
  expired?: boolean;
};

export const Route = createFileRoute("/_public/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch =>
    search.expired === true || search.expired === "true" ? { expired: true } : {},
  component: Login,
});
