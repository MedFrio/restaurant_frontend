import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function MonCompte() {
  const { clientId, token, role, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!clientId) return;

    api.get(`/client-api/clients/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data))
      .catch(() => setError("Impossible de récupérer les informations du compte."));
  }, [clientId, token]);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;

    try {
      await api.delete(`/client-api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Compte supprimé avec succès.");
      logout(); // Déconnecte l'utilisateur
      navigate("/"); // Redirige vers page d'accueil
    } catch {
      setError("Erreur lors de la suppression du compte.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">👤 Mon compte</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        {user ? (
          <div className="bg-white border shadow-sm rounded p-4 space-y-2 text-gray-800">
            <h2 className="text-2xl font-semibold mb-2">Informations personnelles</h2>
            <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Téléphone :</strong> {user.phone}</p>
            <p><strong>Adresse :</strong> {user.address}, {user.city} {user.postalCode}</p>
            <p><strong>Rôle :</strong> {role}</p>
            <p><strong>Statut :</strong> {user.isActive ? "Actif" : "Inactif"}</p>
            <button
              onClick={handleDeleteAccount}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              style={{ width: "100%" }}
            >
              Supprimer mon compte
            </button>

          </div>
        ) : (
          <p className="text-gray-600">Chargement des informations...</p>
        )}
      </div>
    </div>
  );
}
