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
    if (!clientId) {
      // Potentially redirect if no clientId is present, or handle accordingly
      // navigate('/login'); // Example: redirect to login if not authenticated
      return;
    }

    api.get(`/client-api/clients/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Erreur lors de la récupération des infos client :", err);
        setError("Impossible de récupérer les informations du compte. Veuillez réessayer.");
      });
  }, [clientId, token]);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et entraînera la perte de toutes vos données.")) {
      return;
    }

    try {
      await api.delete(`/client-api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Votre compte a été supprimé avec succès.");
      // Small delay for the user to read the success message before redirecting
      setTimeout(() => {
        logout(); // Déconnecte l'utilisateur
        navigate("/"); // Redirige vers page d'accueil
      }, 1500); // 1.5 seconds delay
    } catch (err) {
      console.error("Erreur lors de la suppression du compte :", err);
      setError("Une erreur est survenue lors de la suppression de votre compte. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
      <Header />
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-transform duration-300 ease-in-out hover:scale-[1.01]">
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center flex items-center justify-center">
            <span className="mr-3 text-5xl">⚙️</span> Mon Espace Compte
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold mr-2">Erreur !</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold mr-2">Succès !</strong>
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {user ? (
            <div className="space-y-6 text-gray-800">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
                <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
                  <span className="mr-2 text-3xl">📝</span> Informations personnelles
                </h2>
                <div className="space-y-3 text-lg">
                  <p><strong className="text-gray-900">Nom complet :</strong> {user.firstName} {user.lastName}</p>
                  <p><strong className="text-gray-900">Email :</strong> {user.email}</p>
                  <p><strong className="text-gray-900">Téléphone :</strong> {user.phone || "Non spécifié"}</p>
                  <p><strong className="text-gray-900">Adresse :</strong> {user.address}, {user.postalCode} {user.city}</p>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-200">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                  <span className="mr-2 text-3xl">ℹ️</span> Statut du compte
                </h2>
                <div className="space-y-3 text-lg">
                  <p><strong className="text-gray-900">Rôle :</strong> <span className="capitalize">{role}</span></p>
                  <p>
                    <strong className="text-gray-900">Statut :</strong>{" "}
                    <span className={`font-semibold ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                      {user.isActive ? "Actif" : "Inactif"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-8">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  <span className="mr-2 text-xl">🗑️</span> Supprimer mon compte
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600 mb-4">Chargement de vos informations...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
