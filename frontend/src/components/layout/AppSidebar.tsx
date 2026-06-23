import {
  LayoutDashboard,
  Package,
  PackageSearch,
  User,
  Users,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import logo from "../../public/icon.png";

const baseItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Pedidos", icon: PackageSearch, url: "/orders" },
  { title: "Produtos", icon: Package, url: "/products" },
  { title: "Perfil", icon: User, url: "/profile" },
];

const adminItems = [{ title: "Usuários", icon: Users, url: "/users" }];

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const menuItems =
    user?.admin === true
      ? [...baseItems.slice(0, 3), ...adminItems, baseItems[3]]
      : baseItems;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex h-12 flex-row items-center gap-2 border-b px-4">
        <img className="size-6 shrink-0" src={logo} alt="" />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold">Chat2Order</span>
          <span className="block text-[10px] text-muted-foreground">Operacional</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-8 rounded-md px-3 text-xs",
                        active &&
                          "bg-primary/10 font-medium text-primary hover:bg-primary/10",
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/** @deprecated Use AppSidebar */
export const AppSideBar = AppSidebar;
