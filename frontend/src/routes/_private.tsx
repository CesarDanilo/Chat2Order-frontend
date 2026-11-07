import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getStoredToken } from "@/lib/session";

export const Route = createFileRoute("/_private")({
  beforeLoad: () => {
    if (!getStoredToken()) throw redirect({ to: "/auth" });
  },
  component: PrivateLayout,
});

function PrivateLayout() {
  return (
    <SidebarProvider>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Pular para o conteúdo
      </a>
      <AppSidebar />
      <SidebarInset id="conteudo" tabIndex={-1} className="min-h-svh min-w-0 outline-none">
        <Outlet />
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
