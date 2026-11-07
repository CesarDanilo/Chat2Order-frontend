// Abre a busca rápida (CommandPalette) a partir de qualquer botão da interface.
const EVENT = "chat2order:open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(EVENT));
}

export function onOpenCommandPalette(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

// Atalho exibido conforme o sistema (⌘ no Mac, Ctrl nos demais).
export function commandPaletteShortcut(): string {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform;
  return /mac|iphone|ipad/i.test(platform) ? "⌘K" : "Ctrl K";
}
