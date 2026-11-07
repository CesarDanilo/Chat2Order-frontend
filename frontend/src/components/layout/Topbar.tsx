import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { commandPaletteShortcut, openCommandPalette } from "@/lib/command-palette";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const shortcut = commandPaletteShortcut();

// Cabeçalho de página: menu (celular), título, ação principal, busca rápida e tema.
export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur supports-backdrop-filter:bg-background/75 md:px-6">
      <SidebarTrigger className="-ml-1 size-9 text-muted-foreground md:hidden" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold leading-tight tracking-tight md:text-lg">
          {title}
        </h1>
        {subtitle ? (
          <p className="hidden truncate text-sm text-muted-foreground sm:block">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {actions}
        <Button
          type="button"
          variant="outline"
          className="hidden h-9 gap-2 px-2.5 font-normal text-muted-foreground lg:inline-flex"
          onClick={openCommandPalette}
        >
          <Search className="size-4" aria-hidden="true" />
          Busca rápida
          <kbd className="rounded border bg-muted px-1.5 font-sans text-xs text-muted-foreground">
            {shortcut}
          </kbd>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={openCommandPalette}
          aria-label="Busca rápida"
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
