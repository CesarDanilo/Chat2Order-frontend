export function formatCurrency(value?: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

export function formatDate(
  dateStr?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "short" },
): string {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("pt-BR", options).format(new Date(dateStr));
}

export function formatDateTime(dateStr?: string): string {
  return formatDate(dateStr, { dateStyle: "short", timeStyle: "short" });
}

export function formatRelativeDate(date?: string): string {
  if (!date) return "-";

  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 1000 / 60);

  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;

  return `há ${Math.floor(hours / 24)}d`;
}

export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatOrderStatus(status: string): string {
  if (status.toUpperCase() === "CONCLUIDO") return "Concluído";
  return capitalize(status.toLowerCase());
}
