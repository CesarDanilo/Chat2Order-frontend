import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  User,
  PackageSearch,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
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
import logo from "../public/icon.png";

const baseItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Orders",    icon: PackageSearch,     url: "/orders"    },
  { title: "Profile",   icon: User,            url: "/profile"   },
  { title: "Products",  icon: ShoppingBag,     url: "/products"  },
];

const adminItems = [
  { title: "Users", icon: Users, url: "/users" },
];

export function AppSideBar() {
  const { user } = useAuth();

  const menuItems = user?.admin === true
    ? [...baseItems.slice(0, 3), ...adminItems, baseItems[3]]
    : baseItems;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex h-16 flex-row items-center justify-start gap-x-3 border-b px-6">
        <img className="w-8 shrink-0" src={logo} alt="logo" />
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight">
            Chat2Order
          </span>
          <span className="text-xs text-zinc-500">v1.0 • MVP</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="border-l-2 border-transparent transition-colors hover:border-emerald-600"
                >
                  <SidebarMenuButton asChild className="rounded-none px-6">
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}