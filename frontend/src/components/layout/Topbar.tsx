import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface TopbarProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="flex h-12 w-full shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline">
          ⌘K
        </kbd>
        <ThemeToggle />
      </div>
    </header>
  );
}

/** @deprecated Use Topbar */
export const Header = Topbar;
