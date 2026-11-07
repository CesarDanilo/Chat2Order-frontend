import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, PackageSearch, Plus, User, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/context/auth-context";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import { useOrders } from "@/hooks/queries/use-orders";
import { useProducts } from "@/hooks/queries/use-products";
import { onOpenCommandPalette } from "@/lib/command-palette";
import { formatCurrency, formatPhone } from "@/lib/formatters";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useKeyboardShortcut("k", toggle, { meta: true, ctrl: true });

  // Botões "Busca rápida" do cabeçalho.
  useEffect(() => onOpenCommandPalette(() => setOpen(true)), []);

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Pedidos", to: "/orders", icon: PackageSearch },
    { label: "Produtos", to: "/products", icon: Package },
    ...(user?.admin ? [{ label: "Usuários", to: "/users", icon: Users }] : []),
    { label: "Perfil", to: "/profile", icon: User },
  ];

  function go(to: string) {
    setOpen(false);
    navigate({ to });
  }

  function handleCreateOrder() {
    setOpen(false);
    navigate({ to: "/orders", search: { create: true } });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar pedido, produto ou página..." aria-label="Buscar pedido, produto ou página" />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações">
          <CommandItem onSelect={handleCreateOrder}>
            <Plus className="size-4" aria-hidden="true" />
            Novo pedido
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Páginas">
          {navItems.map((item) => (
            <CommandItem key={item.to} onSelect={() => go(item.to)}>
              <item.icon className="size-4" aria-hidden="true" />
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
                  value={`${order.customerName} ${order.customerPhone} ${order.id}`}
                >
                  <PackageSearch className="size-4" aria-hidden="true" />
                  <span className="min-w-0 truncate">{order.customerName}</span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {formatPhone(order.customerPhone)}
                  </span>
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
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
                  value={`${product.name} ${product.id}`}
                >
                  <Package className="size-4" aria-hidden="true" />
                  <span className="min-w-0 truncate">{product.name}</span>
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
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
