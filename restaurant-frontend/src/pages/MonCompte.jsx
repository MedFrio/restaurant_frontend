import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Client from "./Client";
import Chef from "./Chef";
import Livreur from "./Livreur";
import { AuthProvider, useAuth } from "../context/AuthContext";
import SignUp from "./SignUp";
import Accueil from "./Accueil";
import MesCommandes from "./MesCommandes";
import Admin from "./Admin";


// Route protégée
function ProtectedRoute({ roleRequired, children }) {
  const { role } = useAuth();

  if (!role) return <Navigate to="/" />;

  if (roleRequired && role !== roleRequired) {
    return <Navigate to={`/${role}`} />;
  }

  return children;
}

// Route publique (non accessible si connecté)
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

          {/* Routes publiques */}
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
            path="/mes-commandes"
            element={
              <ProtectedRoute roleRequired="client">
                <MesCommandes />
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

          {/* Page mon-compte accessible à tous les rôles */}
          <Route
            path="/mon-compte"
            element={
              <ProtectedRoute>
                <MonCompte />
              </ProtectedRoute>
            }
          />
          {/* Page admin accessible uniquement aux admins */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roleRequired="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Accueil accessible à tout utilisateur connecté */}
          <Route path="/accueil" element={<Accueil />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
