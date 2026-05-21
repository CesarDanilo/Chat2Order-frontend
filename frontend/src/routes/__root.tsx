import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AppSideBar } from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSideBar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </React.Fragment>
  )
}
