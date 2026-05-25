import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/context/auth-context";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";

export const Route = createFileRoute(
  "/_private/settings"
)({
  component: SettingsPage,
});

function SettingsPage() {

  const navigate = useNavigate();

  const { signOut } = useAuth();

  function handleLogout() {

    signOut();

    navigate({
      to: "/auth",
    });
  }

  return (

    <div className="min-h-screen w-full bg-zinc-100 p-6">

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-zinc-900">
              Configurações
            </h1>

            <p className="text-sm text-zinc-500">
              Gerencie sua conta e preferências
            </p>

          </div>

          <div className="rounded-xl bg-white p-3 shadow-sm">

            <Settings className="size-6 text-zinc-700" />

          </div>

        </div>

        {/* SETTINGS CARDS */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* PROFILE */}
          <Card className="rounded-2xl border-zinc-200 shadow-sm">

            <CardContent className="flex items-start gap-4 p-6">

              <div className="rounded-xl bg-zinc-100 p-3">

                <User className="size-5 text-zinc-700" />

              </div>

              <div className="flex flex-col gap-1">

                <h2 className="font-semibold text-zinc-900">
                  Perfil
                </h2>

                <p className="text-sm text-zinc-500">
                  Atualize seus dados pessoais
                </p>

              </div>

            </CardContent>

          </Card>

          {/* SECURITY */}
          <Card className="rounded-2xl border-zinc-200 shadow-sm">

            <CardContent className="flex items-start gap-4 p-6">

              <div className="rounded-xl bg-zinc-100 p-3">

                <Shield className="size-5 text-zinc-700" />

              </div>

              <div className="flex flex-col gap-1">

                <h2 className="font-semibold text-zinc-900">
                  Segurança
                </h2>

                <p className="text-sm text-zinc-500">
                  Gerencie senha e autenticação
                </p>

              </div>

            </CardContent>

          </Card>

        </div>

        {/* LOGOUT */}
        <Card className="rounded-2xl border-red-200 shadow-sm">

          <CardContent className="flex flex-col gap-4 p-6">

            <div>

              <h2 className="font-semibold text-red-600">
                Encerrar sessão
              </h2>

              <p className="text-sm text-zinc-500">
                Você será desconectado da plataforma
              </p>

            </div>

            <Button
              variant="destructive"
              className="w-fit"
              onClick={handleLogout}
            >

              <LogOut />

              Sair da conta

            </Button>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}