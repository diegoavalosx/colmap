import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import Login from "./components/Login.tsx";
import Dashboard from "./components/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./components/AuthProvider.tsx";
import SignUp from "./components/SignUp.tsx";
import "./styles/styles.css";
import EmailVerification from "./components/EmailVerification.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/*"
            element={
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
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
