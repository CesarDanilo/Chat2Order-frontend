import {
  LayoutDashboard,
  Users,
  Settings,
  ShoppingBag,
} from "lucide-react";

import { Link } from "@tanstack/react-router";

import logo from "../public/icon.png";

export function Sidebar() {
  return (
    <aside className="w-72 h-screen bg-white border-r border-zinc-200 flex flex-col justify-between">
      
      <div>
        <div className="flex items-center gap-3 px-6 py-6">
          <img
            src={logo}
            alt="Logo"
            className="w-9 h-9 rounded-xl shadow-sm"
          />

          <div className="flex flex-col">
            <span className="font-semibold text-zinc-800">
              Chat2Order
            </span>

            <span className="text-xs text-zinc-500">
              v1.0 MVP
            </span>
          </div>
        </div>

        <nav className="mt-4 px-3 flex flex-col gap-1">

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-900 font-medium transition text-sm"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            to="/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 transition text-sm"
          >
            <ShoppingBag size={20} />
            Pedidos
          </Link>

          <Link
            to="/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 transition text-sm"
          >
            <Users size={20} />
            Usuários
          </Link>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 transition text-sm"
          >
            <Settings size={20} />
            Configurações
          </Link>

        </nav>
      </div>

      <div className="border-t border-zinc-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200" />

          <div className="flex flex-col">
            <span className="text-sm font-medium">
              César Danilo
            </span>

            <span className="text-xs text-zinc-500">
              Administrador
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}