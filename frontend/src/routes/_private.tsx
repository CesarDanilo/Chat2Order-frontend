import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSideBar } from "@/components/Sidebar";
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
        <AppSideBar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center border-b bg-white px-4 md:hidden">
            <SidebarTrigger className="text-zinc-600" />
            <span className="ml-3 text-sm font-semibold text-zinc-900">
              Chat2Order
            </span>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}