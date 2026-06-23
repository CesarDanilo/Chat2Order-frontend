import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  PackageSearch,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import { useOrders } from "@/hooks/queries/use-orders";
import { useProducts } from "@/hooks/queries/use-products";
import { formatCurrency } from "@/lib/formatters";

interface CommandPaletteProps {}

export function CommandPalette(_props: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useKeyboardShortcut("k", toggle, { meta: true, ctrl: true });

  const navItems = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Pedidos", to: "/orders", icon: PackageSearch },
      { label: "Produtos", to: "/products", icon: Package },
      { label: "Perfil", to: "/profile", icon: User },
      { label: "Usuários", to: "/users", icon: Users },
    ],
    [],
  );

  function go(to: string) {
    setOpen(false);
    navigate({ to });
  }

  function handleCreateOrder() {
    setOpen(false);
    navigate({ to: "/orders", search: { create: true } });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Busca rápida">
      <CommandInput placeholder="Buscar pedido, produto ou navegar..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>

        <CommandGroup heading="Ações">
          <CommandItem onSelect={handleCreateOrder}>
            <Plus className="size-4" />
            Novo pedido
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navegação">
          {navItems.map((item) => (
            <CommandItem key={item.to} onSelect={() => go(item.to)}>
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {orders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pedidos">
              {orders.slice(0, 8).map((order) => (
                <CommandItem
                  key={order.id}
                  onSelect={() => go("/orders")}
                  value={`${order.customerName} ${order.id}`}
                >
                  <Search className="size-4" />
                  <span className="truncate">{order.customerName}</span>
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                    {formatCurrency(order.total)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {products.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Produtos">
              {products.slice(0, 8).map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => go("/products")}
                  value={product.name}
                >
                  <Package className="size-4" />
                  <span className="truncate">{product.name}</span>
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                    {formatCurrency(product.price)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
