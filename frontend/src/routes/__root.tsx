import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
      <div className='flex'>
        <Sidebar />
        <Outlet />
      </div>
    </React.Fragment>
  )
}
