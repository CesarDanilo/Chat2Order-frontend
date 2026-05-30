import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  BadgeCheck,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/_private/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();

  const { signOut } = useAuth();

  function handleLogout() {
    signOut();

    navigate({
      to: "/auth",
    });
  }
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 p-6">
        {/* HEADER */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-zinc-900">Meu Perfil</h1>

            <p className="mt-1 text-xs text-zinc-500">
              Gerencie suas informações pessoais
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="
                h-8 rounded-xl
                border-zinc-200
                bg-white
                px-4
                text-xs
                shadow-none
                hover:bg-zinc-100
              "
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Sair da conta
            </Button>

            <Button
              className="
                h-8 rounded-xl
                bg-zinc-900
                px-4
                text-xs
                hover:bg-zinc-800
              "
            >
              Salvar alterações
            </Button>
          </div>
        </section>

        {/* PROFILE */}
        <Card className="rounded-3xl border-zinc-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex h-20 w-20 items-center justify-center
                    rounded-3xl
                    bg-zinc-900
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  CD
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      César Danilo
                    </h2>

                    <div
                      className="
                        flex items-center gap-1
                        rounded-full
                        bg-emerald-100
                        px-2 py-1
                        text-[10px]
                        font-medium
                        text-emerald-700
                      "
                    >
                      <BadgeCheck size={12} />
                      Verificado
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-zinc-500">
                    Desenvolvedor Full Stack
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <InfoBadge
                      icon={<Mail size={12} />}
                      label="cesar@email.com"
                    />

                    <InfoBadge
                      icon={<Phone size={12} />}
                      label="(67) 99999-9999"
                    />

                    <InfoBadge
                      icon={<MapPin size={12} />}
                      label="Dourados, MS"
                    />
                  </div>
                </div>
              </div>

              {/* PLAN */}
              <div
                className="
                  rounded-2xl
                  border border-zinc-200
                  bg-zinc-50
                  p-5
                "
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-zinc-500" />

                  <span className="text-xs text-zinc-500">Plano atual</span>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-zinc-900">
                  Gratuito
                </h3>

                <p className="mt-1 max-w-[220px] text-xs leading-5 text-zinc-500">
                  Acesso limitado aos recursos básicos da plataforma.
                </p>

                <Button
                  variant="outline"
                  className="
                    mt-4 h-8 rounded-xl
                    border-zinc-200
                    bg-white
                    px-4
                    text-xs
                    shadow-none
                  "
                >
                  Fazer upgrade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACCOUNT */}
        <Card className="rounded-3xl border-zinc-200 shadow-none">
          <CardContent className="p-6">
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-zinc-900">
                Informações da conta
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Atualize suas informações pessoais
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo" placeholder="Seu nome completo" />

              <Field label="Usuário" placeholder="Seu nome de usuário" />

              <Field label="E-mail" placeholder="Seu e-mail profissional" />

              <Field label="Telefone" placeholder="Seu número de telefone" />

              <Field label="Endereço" placeholder="Seu endereço completo" />

              <Field label="Cidade" placeholder="Sua cidade" />

              <Field
                label="Nova senha"
                placeholder="********"
                type="password"
              />

              <Field
                label="Confirmar senha"
                placeholder="********"
                type="password"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                className="
                  h-9 rounded-xl
                  bg-zinc-900
                  px-5
                  text-xs
                  hover:bg-zinc-800
                "
              >
                Salvar alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  type?: string;
};

function Field({ label, placeholder, type = "text" }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-zinc-600">{label}</Label>

      <Input
        type={type}
        placeholder={placeholder}
        className="
          h-10 rounded-xl
          border-zinc-200
          bg-white
          text-sm
          shadow-none
          focus-visible:ring-1
          focus-visible:ring-zinc-300
        "
      />
    </div>
  );
}

type InfoBadgeProps = {
  icon: React.ReactNode;
  label: string;
};

function InfoBadge({ icon, label }: InfoBadgeProps) {
  return (
    <div
      className="
        flex items-center gap-1.5
        rounded-full
        border border-zinc-200
        bg-white
        px-3 py-1.5
        text-xs
        text-zinc-600
      "
    >
      {icon}
      {label}
    </div>
  );
}
