// Classes dos tons de estado (tokens do index.css). Usadas em selos e indicadores.
export type Tone = "success" | "warning" | "danger" | "neutral";

export const toneClasses: Record<Tone, string> = {
  success: "border-success-border bg-success-bg text-success-fg",
  warning: "border-warning-border bg-warning-bg text-warning-fg",
  danger: "border-danger-border bg-danger-bg text-danger-fg",
  neutral: "border-neutral-border bg-neutral-bg text-neutral-fg",
};
