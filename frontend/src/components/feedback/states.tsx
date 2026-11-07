import type { LucideIcon } from "lucide-react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Lista vazia: diz o que aconteceu e qual é o próximo passo.
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}

// Falha ao carregar: mensagem anunciada a leitores de tela e ação para tentar de novo.
export function ErrorState({
  title,
  description = "Verifique sua conexão e tente novamente.",
  onRetry,
  retrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-danger-bg text-danger-fg">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-5"
        onClick={onRetry}
        disabled={retrying}
      >
        <RotateCw className={cn("size-4", retrying && "animate-spin")} aria-hidden="true" />
        Tentar novamente
      </Button>
    </div>
  );
}
