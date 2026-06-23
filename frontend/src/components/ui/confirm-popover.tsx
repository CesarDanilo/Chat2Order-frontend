import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ConfirmPopoverProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}

export function ConfirmPopover({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
  destructive = true,
}: ConfirmPopoverProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-xs font-medium">{title}</p>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
