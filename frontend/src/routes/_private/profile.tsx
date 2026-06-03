import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserService, type User } from "@/services/user-services";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_private/profile")({
  component: ProfilePage,
});

// ─── Singleton do service (não recriar a cada render) ─────────────────────────

const userService = new UserService();

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth(); // authUser.id = ID do usuário logado

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!authUser?.id) return;

    let cancelled = false;

    userService
      .readById(authUser.id)
      .then((data) => {
        if (cancelled) return;
        setUser(data);
        setForm((prev) => ({ ...prev, name: data.name, email: data.email }));
      })
      .catch(() => toast.error("Erro ao carregar perfil."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    if (!authUser?.id) return;

    if (form.password && form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password // service exige password no UserCreate
    };

    try {
      setSaving(true);
      const updated = await userService.update(authUser.id, payload);
      setUser(updated);
      toast.success("Perfil atualizado com sucesso.");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    signOut();
    navigate({ to: "/auth" });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 size={20} className="animate-spin text-zinc-400" />
      </main>
    );
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
          <Button
            variant="outline"
            className="h-8 rounded-xl border-zinc-200 bg-white px-4 text-xs shadow-none hover:bg-zinc-100"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Sair da conta
          </Button>
        </section>

        {/* PROFILE CARD */}
        <Card className="rounded-3xl border-zinc-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    {user?.name ?? "—"}
                  </h2>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">
                    <BadgeCheck size={12} />
                    Verificado
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <InfoBadge icon={<Mail size={12} />} label={user?.email ?? "—"} />
                  <InfoBadge icon={<Phone size={12} />} label="(67) 99999-9999" />
                  <InfoBadge icon={<MapPin size={12} />} label="Dourados, MS" />
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-500">Plano atual</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-zinc-900">
                  {user?.admin ? "Admin" : "Gratuito"}
                </h3>
                <p className="mt-1 max-w-[220px] text-xs leading-5 text-zinc-500">
                  Acesso limitado aos recursos básicos da plataforma.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 h-8 rounded-xl border-zinc-200 bg-white px-4 text-xs shadow-none"
                >
                  Fazer upgrade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACCOUNT FORM */}
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
              <Field
                label="Nome completo"
                name="name"
                placeholder="Seu nome completo"
                value={form.name}
                onChange={handleChange}
              />
              <Field
                label="E-mail"
                name="email"
                placeholder="Seu e-mail"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <Field
                label="Nova senha"
                name="password"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={handleChange}
              />
              <Field
                label="Confirmar senha"
                name="confirmPassword"
                placeholder="••••••••"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-9 rounded-xl bg-zinc-900 px-5 text-xs hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Field({ label, name, placeholder, type = "text", value, onChange }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-zinc-600">{label}</Label>
      <Input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-10 rounded-xl border-zinc-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-zinc-300"
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
    <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600">
      {icon}
      {label}
    </div>
  );
}