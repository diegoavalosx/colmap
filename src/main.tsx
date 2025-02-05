import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import App2 from "./App2.tsx";
import App3 from "./App3.tsx";
import Login from "./components/Login.tsx";
import Dashboard from "./components/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./components/AuthProvider.tsx";
import SignUp from "./components/SignUp.tsx";
import "./styles/styles.css";
import EmailVerification from "./components/EmailVerification.tsx";
import NotFound from "./components/NotFound.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/v2" element={<App2 />} />
          <Route path="/v3" element={<App3 />} />
          <Route path="*" element={<NotFound />}/>
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
