import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function MesCommandes() {
  const { clientId, token } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [menuMap, setMenuMap] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch menu to create a map for item names
    api.get("/order-api/menu")
      .then((res) => {
        const map = {};
        res.data.forEach(item => {
          map[item.id] = item.nom;
        });
        setMenuMap(map);
      })
      .catch(() => console.error("Impossible de charger le menu pour l'affichage des commandes."));
  }, []);

  const fetchCommandes = () => {
    if (!clientId || !token) {
      // Handle cases where clientId or token might be missing (e.g., not logged in)
      setError("Vous devez être connecté pour voir vos commandes.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    api.get("/order-api/commandes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        // Filter commands by the logged-in clientId
        const mesCommandes = res.data.filter(cmd => cmd.clientId === clientId);
        // Sort commands by creation date, newest first (assuming `createdAt` or similar field exists)
        // If not, you might need to add a timestamp to your command objects
        const sortedCommandes = mesCommandes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCommandes(sortedCommandes);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des commandes :", err);
        setError("Impossible de charger vos commandes. Veuillez réessayer plus tard.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCommandes();
  }, [clientId, token]); // Re-fetch when clientId or token changes

  const getStatusClasses = (status) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "EN_PREPARATION":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "EN_LIVRAISON":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "LIVREE":
        return "bg-green-100 text-green-800 border-green-300";
      case "ANNULEE":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const annulerCommande = async (commandeId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.")) {
      return;
    }
    setMessage(""); // Clear previous messages
    setError(""); // Clear previous errors

    try {
      const res = await api.patch(`/order-api/commandes/${commandeId}/status`, {
        status: "ANNULEE",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        setMessage(`✅ La commande #${commandeId} a été annulée avec succès.`);
        fetchCommandes(); // Recharger les commandes pour mettre à jour le statut
      } else {
        setMessage("❌ Échec de l'annulation de la commande. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de l'annulation de la commande :", err);
      setMessage("❌ Impossible d'annuler la commande. Le service est peut-être indisponible ou la commande ne peut plus être annulée.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-4xl font-extrabold text-indigo-800 mb-4 md:mb-0 flex items-center">
              <span className="mr-3 text-5xl">📜</span> Historique de vos Commandes
            </h1>
            <button
              onClick={() => navigate("/client")}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center"
            >
              <span className="mr-2 text-xl">✨</span> Passer une nouvelle commande
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold mr-2">Erreur !</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div className={`px-4 py-3 rounded-lg relative mb-6 ${message.startsWith('✅') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-yellow-100 border border-yellow-400 text-yellow-700'}`} role="alert">
              <strong className="font-bold mr-2">{message.startsWith('✅') ? 'Succès !' : 'Info :'}</strong>
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600 mb-4">Chargement de vos commandes...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : commandes.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg shadow-inner">
              <p className="text-xl text-gray-700 mb-2">Vous n'avez pas encore passé de commande.</p>
              <p className="text-md text-gray-500">Commencez par explorer notre délicieux menu !</p>
              <button
                onClick={() => navigate("/client")}
                className="mt-6 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out"
              >
                Commander maintenant
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {commandes.map((commande) => (
                <div key={commande.id} className="bg-white p-6 border rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <span className="mr-2 text-2xl">#️⃣</span> Commande #{commande.id}
                    </h2>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getStatusClasses(commande.status)} capitalize`}>
                      {commande.status.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>

                  {/* Display creation date if available (assuming `createdAt` field) */}
                  {commande.createdAt && (
                    <p className="text-sm text-gray-500 mb-3 flex items-center">
                      <span className="mr-2">⏰</span> Passée le : {new Date(commande.createdAt).toLocaleString('fr-FR')}
                    </p>
                  )}

                  <div className="text-md text-gray-700 mb-4 space-y-1">
                    <p className="flex items-center"><span className="mr-2">📍</span> {commande.adresse}</p>
                    <p className="flex items-center"><span className="mr-2">📞</span> {commande.telephone}</p>
                  </div>

                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Articles :</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 mb-4 text-gray-700">
                    {commande.items?.map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="text-indigo-500 mr-2">▪</span> {menuMap[item.menuId] || `Plat inconnu (ID: ${item.menuId})`} <span className="font-bold ml-1">× {item.quantite}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Total price, if available */}
                  {commande.totalPrice && ( // Assuming you have a totalPrice field on your order object
                    <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
                      <p className="text-xl font-bold text-indigo-700">Total : {commande.totalPrice.toFixed(2)} €</p>
                    </div>
                  )}

                  {["EN_ATTENTE", "EN_PREPARATION"].includes(commande.status) && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <button
                        onClick={() => annulerCommande(commande.id)}
                        className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center"
                      >
                        <span className="mr-2 text-xl">🗑️</span> Annuler la commande
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
