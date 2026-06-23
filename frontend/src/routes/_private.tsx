import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_private")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (!token) throw redirect({ to: "/auth" });
  },
  component: PrivateLayout,
});

function PrivateLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 items-center border-b bg-background px-4 md:hidden">
            <SidebarTrigger className="text-muted-foreground" />
            <span className="ml-3 text-sm font-semibold">Chat2Order</span>
          </header>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
