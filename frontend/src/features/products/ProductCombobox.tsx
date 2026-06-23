import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/services/products-services";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface ProductComboboxProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
  disabled?: boolean;
}

export function ProductCombobox({
  products,
  open,
  onOpenChange,
  onSelect,
  disabled,
}: ProductComboboxProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products],
  );

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return availableProducts;
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [availableProducts, debouncedQuery]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          <Search className="size-3.5" />
          Buscar produto
          <kbd className="ml-1 hidden rounded border bg-muted px-1 text-[10px] sm:inline">
            /
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Pesquisar produto..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {filtered.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    onSelect(product);
                    onOpenChange(false);
                    setQuery("");
                  }}
                  className="flex justify-between gap-2 text-xs"
                >
                  <span className="truncate">{product.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCurrency(product.price)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
