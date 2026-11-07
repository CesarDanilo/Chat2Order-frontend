import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface DrawerPanelHeaderProps {
  title: string;
  description: string;
}

// Cabeçalho dos painéis laterais: título, descrição e botão de fechar (Esc também fecha).
export function DrawerPanelHeader({ title, description }: DrawerPanelHeaderProps) {
  return (
    <DrawerHeader className="shrink-0 flex-row items-start justify-between gap-4 border-b px-5 py-4 text-left md:gap-4">
      <div className="min-w-0 space-y-1">
        <DrawerTitle className="text-base font-semibold">{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </div>
      <DrawerClose asChild>
        <Button type="button" variant="ghost" size="icon" className="-mr-2 -mt-1 shrink-0" aria-label="Fechar">
          <X className="size-4" aria-hidden="true" />
        </Button>
      </DrawerClose>
    </DrawerHeader>
  );
}
