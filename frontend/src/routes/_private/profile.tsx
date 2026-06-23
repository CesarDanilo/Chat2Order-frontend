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
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { UserService, type User } from "@/services/user-services";

export const Route = createFileRoute("/_private/profile")({
  component: ProfilePage,
});

const userService = new UserService();

function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();

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
      password: form.password,
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
      <div className="flex min-h-full flex-col">
        <Topbar title="Meu perfil" subtitle="Carregando..." />
        <div className="mx-auto w-full max-w-3xl space-y-3 p-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <Topbar
        title="Meu perfil"
        subtitle="Gerencie suas informações pessoais"
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={handleLogout}
          >
            <LogOut className="size-3.5" />
            Sair
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
        <Card className="rounded-lg shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">{user?.name ?? "—"}</h2>
                  <span className="inline-flex items-center gap-1 rounded border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-1.5 py-0.5 text-[10px] text-[var(--status-success-fg)]">
                    <BadgeCheck className="size-3" />
                    Verificado
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <InfoBadge icon={<Mail className="size-3" />} label={user?.email ?? "—"} />
                  <InfoBadge icon={<Phone className="size-3" />} label="(67) 99999-9999" />
                  <InfoBadge icon={<MapPin className="size-3" />} label="Dourados, MS" />
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="size-3.5" />
                  Plano atual
                </div>
                <p className="mt-1 text-sm font-semibold">
                  {user?.admin ? "Admin" : "Gratuito"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-none">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold">Informações da conta</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Field label="Nome completo" name="name" value={form.name} onChange={handleChange} />
              <Field label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} />
              <Field label="Nova senha" name="password" type="password" value={form.password} onChange={handleChange} />
              <Field label="Confirmar senha" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" className="h-8 text-xs" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : "Salvar alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs">
        {label}
      </Label>
      <Input id={name} name={name} type={type} value={value} onChange={onChange} className="h-8 text-xs" />
    </div>
  );
}

function InfoBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] text-muted-foreground">
      {icon}
      {label}
    </div>
  );
}
