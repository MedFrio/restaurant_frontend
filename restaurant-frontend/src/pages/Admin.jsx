import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import Header from "../components/Header";

export default function Admin() {
  const [clients, setClients] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [clientsRes, menuRes, ordersRes, livraisonsRes] = await Promise.all([
          api.get("/client-api/clients"),
          api.get("/order-api/menu"),
          api.get("/order-api/commandes"),
          api.get("/delivery-api/livraisons")
        ]);

        // Assurez-vous que les données sont des tableaux.
        // C'est crucial si l'API renvoie autre chose qu'un tableau ou plante.
        setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
        setMenu(Array.isArray(menuRes.data) ? menuRes.data : []);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setLivraisons(Array.isArray(livraisonsRes.data) ? livraisonsRes.data : []);

      } catch (err) {
        console.error("Erreur lors du chargement des données admin:", err);

        // Analyse plus fine de l'erreur pour le message utilisateur
        let errorMessage = "Une erreur est survenue lors du chargement des données.";
        if (err.response) {
            // L'API a répondu avec un statut d'erreur (e.g., 401, 403, 500)
            if (err.response.status === 401 || err.response.status === 403) {
                errorMessage = "Accès non autorisé. Veuillez vous connecter avec un compte admin.";
            } else if (err.response.data && typeof err.response.data === 'string' && err.response.data.startsWith("eyJhbGciOi")) {
                errorMessage = "Erreur d'authentification ou token invalide. La réponse n'est pas JSON.";
            }
            else {
                errorMessage = err.response.data?.message || `Erreur serveur: ${err.response.status}`;
            }
        } else if (err.request) {
            // La requête a été faite mais aucune réponse reçue (e.g., réseau down)
            errorMessage = "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
        } else {
            // Quelque chose d'autre a déclenché l'erreur (e.g., erreur JS dans la requête setup)
            errorMessage = err.message || "Une erreur inattendue est survenue.";
        }
        setError(errorMessage);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const supprimerClient = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await api.delete(`/client-api/clients/${id}`);
        setClients(prevClients => prevClients.filter(c => c.id !== id));
        alert("Client supprimé avec succès !");
      } catch (err) {
        console.error("Erreur lors de la suppression du client:", err);
        alert(err.response?.data?.message || err.message || "Erreur lors de la suppression du client.");
      }
    }
  };

  // Helper pour styliser les statuts
  const getStatusBadgeClass = (status) => {
    // Convertir en string si ce n'est pas déjà le cas, puis toUpperCase
    const normalizedStatus = String(status).toUpperCase();

    switch (normalizedStatus) {
      case "EN_ATTENTE":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PREPAREE":
      case "PREPARED":
        return "bg-blue-100 text-blue-800";
      case "EN_LIVRAISON":
      case "IN_DELIVERY":
        return "bg-purple-100 text-purple-800";
      case "LIVREE":
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "ANNULEE":
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "TRUE": // Pour les booléens, si converti en string
        return "bg-green-100 text-green-800";
      case "FALSE": // Pour les booléens, si converti en string
        return "bg-red-100 text-red-800";
      default:
        // Pour les statuts non reconnus ou des valeurs null/undefined converties en "UNDEFINED"/"NULL"
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-gray-900 min-h-screen text-gray-100 font-sans">
      <Header />
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-lg">
          <span className="text-6xl mr-3">👑</span>Tableau de bord Admin
        </h1>

        {loading && (
          <div className="bg-blue-900 bg-opacity-70 border border-blue-700 text-blue-200 p-4 rounded-lg mb-8 shadow-md text-center">
            <p className="font-semibold text-lg animate-pulse">Chargement des données...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-70 border border-red-700 text-red-200 p-4 rounded-lg mb-8 shadow-md text-center">
            <p className="font-semibold text-lg">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()} // Recharger la page pour réessayer
              className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md transition duration-200"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Conditionner l'affichage des sections si pas d'erreur majeure et pas en chargement */}
        {!loading && !error && (
          <>
            {/* Clients Section */}
            <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-12 border border-white/20">
              <h2 className="text-3xl font-bold text-indigo-300 mb-6 flex items-center">
                <span className="mr-3 text-4xl">👤</span> Gestion des Utilisateurs
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Téléphone</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {clients.length > 0 ? (
                      clients.map((user, index) => (
                        <tr key={user.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'} hover:bg-indigo-700 transition-colors duration-200`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.phone}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => supprimerClient(user.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors duration-200"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-400">Aucun client trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Menu Section */}
            <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-12 border border-white/20">
              <h2 className="text-3xl font-bold text-blue-300 mb-6 flex items-center">
                <span className="mr-3 text-4xl">🍽️</span> Plats du Menu
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prix</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Catégorie</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {menu.length > 0 ? (
                      menu.map((plat, index) => (
                        <tr key={plat.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'} hover:bg-blue-700 transition-colors duration-200`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{plat.nom}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{plat.description}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{plat.prix} €</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{plat.categorie}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(plat.disponible)}`}>
                              {plat.disponible ? "Oui" : "Non"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-400">Aucun plat trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Commandes Section */}
            <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-12 border border-white/20">
              <h2 className="text-3xl font-bold text-green-300 mb-6 flex items-center">
                <span className="mr-3 text-4xl">🧾</span> Commandes Clients
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID Commande</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresse</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Téléphone</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plats Commandés</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {orders.length > 0 ? (
                      orders.map((order, index) => (
                        <tr key={order.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'} hover:bg-green-700 transition-colors duration-200`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{order.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{order.adresse}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.telephone}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            <ul className="list-disc ml-4 space-y-1">
                              {order.items?.map((item, idx) => {
                                const plat = menu.find(p => p.id === item.menuId);
                                return <li key={idx}>{plat ? plat.nom : `Plat ID: ${item.menuId} (Inconnu)`} × {item.quantite}</li>;
                              })}
                            </ul>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-400">Aucune commande trouvée.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Livraisons Section */}
            <section className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-orange-300 mb-6 flex items-center">
                <span className="mr-3 text-4xl">🚚</span> Suivi des Livraisons
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID Livraison</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresse Départ</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresse Arrivée</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {livraisons.length > 0 ? (
                      livraisons.map((liv, index) => (
                        <tr key={liv.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'} hover:bg-orange-700 transition-colors duration-200`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{liv.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(liv.statut)}`}>
                              {liv.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{liv.clientNom} ({liv.clientTelephone})</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{liv.adresseDepart}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{liv.adresseArrivee}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-400">Aucune livraison trouvée.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  );
}
