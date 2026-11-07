import { Badge } from "@/components/ui/badge";
import { toneClasses, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

interface ToneBadgeProps {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}

// Selo de estado: cor + texto (a cor nunca é a única pista).
export function ToneBadge({ tone, children, className }: ToneBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 rounded-md px-2 text-xs font-medium", toneClasses[tone], className)}
    >
      {children}
    </Badge>
  );
}
