import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Login from "./components/Login.tsx";
import "./styles/styles.css";
import Dashboard from "./components/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./components/AuthProvider.tsx";
import SignIn from "./components/SignIn.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <StrictMode>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </StrictMode>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
