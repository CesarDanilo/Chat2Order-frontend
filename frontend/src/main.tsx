import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "@/context/auth-context";
import { AppProviders } from "@/components/providers/app-providers";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </AppProviders>,
);
