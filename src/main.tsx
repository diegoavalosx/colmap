import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App3 from "./App3.tsx";
import Login from "./components/Login.tsx";
import Dashboard from "./components/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./components/AuthProvider.tsx";
import "./styles/styles.css";
import EmailVerification from "./components/EmailVerification.tsx";
import NotFound from "./components/NotFound.tsx";
import Verified from "./components/Verified.tsx";
import AddLocation from "./components/AddLocation.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App3 />} />
          <Route path="/verified" element={<Verified />} />
          <Route
            path="/*"
            element={
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/dashboard/*"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/email-verification"
                    element={<EmailVerification />}
                  />
                  <Route path="*" element={<NotFound />} />
                  <Route path="addlocation" element={<AddLocation />} />
                </Routes>
              </AuthProvider>
            }
          />
        </Routes>
      </Router>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
