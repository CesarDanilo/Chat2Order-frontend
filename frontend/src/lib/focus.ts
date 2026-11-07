// Foco inicial dos painéis laterais: o campo marcado com data-autofocus.
// Sem ele, o próprio painel (comportamento padrão do vaul); Tab segue para os controles.
export function focusDrawerField(event: Event) {
  event.preventDefault();
  const container = event.currentTarget as HTMLElement | null;
  const field = container?.querySelector<HTMLElement>("[data-autofocus]");
  (field ?? container)?.focus();
}
