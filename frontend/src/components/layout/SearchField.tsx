import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  // Rótulo acessível (lido por leitores de tela); o placeholder é só um exemplo.
  label: string;
  placeholder?: string;
  className?: string;
}

export function SearchField({ value, onChange, label, placeholder, className }: SearchFieldProps) {
  return (
    <InputGroup className={cn("h-9 w-full bg-card sm:max-w-xs", className)}>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        maxLength={100}
        autoComplete="off"
      />
      <InputGroupAddon>
        <SearchIcon className="size-4" aria-hidden="true" />
      </InputGroupAddon>
    </InputGroup>
  );
}
