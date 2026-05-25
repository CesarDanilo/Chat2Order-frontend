import ReactDOM from "react-dom/client";

import {
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

import { AuthProvider } from "@/context/auth-context";

import "./index.css";

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM
  .createRoot(document.getElementById("root")!)
  .render(

    <AuthProvider>

      <RouterProvider router={router} />

    </AuthProvider>

  );