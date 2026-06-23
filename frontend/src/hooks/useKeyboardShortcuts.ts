import { useEffect } from "react";

interface ShortcutOptions {
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = {},
) {
  const {
    meta = false,
    ctrl = false,
    shift = false,
    enabled = true,
    preventDefault = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping && key.length === 1 && !meta && !ctrl) return;

      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      const modifierMatch =
        (!meta || event.metaKey) &&
        (!ctrl || event.ctrlKey) &&
        (!shift || event.shiftKey);

      const wantsMetaOrCtrl = meta || ctrl;
      const hasMetaOrCtrl = event.metaKey || event.ctrlKey;

      if (!keyMatch || !modifierMatch) return;
      if (wantsMetaOrCtrl && !hasMetaOrCtrl) return;
      if (!wantsMetaOrCtrl && (event.metaKey || event.ctrlKey)) return;

      if (preventDefault) event.preventDefault();
      callback();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback, key, meta, ctrl, shift, enabled, preventDefault]);
}
