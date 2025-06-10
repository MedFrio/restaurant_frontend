import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Client from "./pages/Client";
import Chef from "./pages/Chef";
import Livreur from "./pages/Livreur";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ roleRequired, children }) {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/" />;
  }

  if (role !== roleRequired) {
    return <Navigate to={`/${role}`} />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

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

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
