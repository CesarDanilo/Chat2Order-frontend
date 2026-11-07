import { cn } from "@/lib/utils";

interface FieldErrorProps {
  id?: string;
  message?: string;
  className?: string;
}

// Erro junto ao campo. role="alert" anuncia a mensagem assim que ela aparece;
// ligue o campo a ela com aria-describedby={fieldErrorId(...)}.
export function FieldError({ id, message, className }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={cn("text-xs font-medium text-destructive", className)}>
      {message}
    </p>
  );
}

interface FieldHintProps {
  id?: string;
  children: React.ReactNode;
}

export function FieldHint({ id, children }: FieldHintProps) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}
