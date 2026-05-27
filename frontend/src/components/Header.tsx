interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-background px-6">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{title}</span>

        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </header>
  );
}
