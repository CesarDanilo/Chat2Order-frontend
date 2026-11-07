import { LayoutDashboard, Package, PackageSearch, User, Users } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import logo from "../../public/icon.png";

const operationItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Pedidos", icon: PackageSearch, url: "/orders" },
  { title: "Produtos", icon: Package, url: "/products" },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2);
  return (letters ?? "?").toUpperCase();
}

export function AppSidebar() {
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const accountItems = [
    ...(user?.admin === true ? [{ title: "Usuários", icon: Users, url: "/users" }] : []),
    { title: "Perfil", icon: User, url: "/profile" },
  ];

  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);
  // No celular o menu é um painel: fecha ao navegar.
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-16 flex-row items-center gap-2.5 border-b px-4">
        <img className="size-7 shrink-0" src={logo} alt="" width={28} height={28} />
        <div className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold text-foreground">Chat2Order</span>
          <span className="block text-xs text-muted-foreground">Pedidos pelo WhatsApp</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => (
                <NavItem key={item.url} {...item} active={isActive(item.url)} onNavigate={closeMobile} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <NavItem key={item.url} {...item} active={isActive(item.url)} onNavigate={closeMobile} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user ? (
        <SidebarFooter className="border-t p-3">
          <Link
            to="/profile"
            onClick={closeMobile}
            className="flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent"
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            >
              {initials(user.name)}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.admin ? "Administrador" : "Funcionário"}
              </span>
            </span>
          </Link>
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}

function NavItem({
  title,
  icon: Icon,
  url,
  active,
  onNavigate,
}: {
  title: string;
  icon: typeof User;
  url: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className="h-9 gap-3 px-3 data-active:font-medium data-active:text-sidebar-accent-foreground"
      >
        <Link to={url} onClick={onNavigate} aria-current={active ? "page" : undefined}>
          <Icon aria-hidden="true" />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
