import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Client from "./pages/Client";
import Chef from "./pages/Chef";
import Livreur from "./pages/Livreur";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SignUp from "./pages/SignUp";
import Accueil from "./pages/Accueil";

// Route protégée pour chaque rôle
function ProtectedRoute({ roleRequired, children }) {
  const { role } = useAuth();

  if (!role) return <Navigate to="/" />;
  if (role !== roleRequired) return <Navigate to={`/${role}`} />;

  return children;
}

// Si connecté, empêche l'accès aux pages de login/signup
function PublicOnlyRoute({ children }) {
  const { role } = useAuth();
  if (role) return <Navigate to="/accueil" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques avec redirection si connecté */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignUp />
              </PublicOnlyRoute>
            }
          />

          {/* Pages protégées par rôle */}
          <Route
            path="/client"
            element={
              <ProtectedRoute roleRequired="client">
                <Client />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef"
            element={
              <ProtectedRoute roleRequired="chef">
                <Chef />
              </ProtectedRoute>
            }
          />
          <Route
            path="/livreur"
            element={
              <ProtectedRoute roleRequired="livreur">
                <Livreur />
              </ProtectedRoute>
            }
          />

          {/* Accueil accessible à tous connectés */}
          <Route path="/accueil" element={<Accueil />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
