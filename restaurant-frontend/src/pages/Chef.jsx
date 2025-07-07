import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import Header from "../components/Header";

export default function Chef() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newDish, setNewDish] = useState({
    nom: "",
    description: "",
    prix: 0,
    categorie: "PLAT_PRINCIPAL",
  });

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order-api/commandes");
      setOrders(res.data);
    } catch {
      setError("❌ Impossible de récupérer les commandes");
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await api.get("/order-api/menu");
      setMenu(res.data);
    } catch {
      setError("❌ Impossible de récupérer le menu");
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/order-api/commandes/${orderId}/status`, {
        status: newStatus,
      });
      if (res.status === 200) {
        setMessage(`✅ Commande ${orderId} → ${newStatus}`);
        fetchOrders();
      } else {
        setMessage("❌ Erreur lors de la mise à jour du statut");
      }
    } catch {
      setMessage("❌ Erreur réseau");
    }
  };

  const handleAddDish = async () => {
    setMessage("");
    try {
      const res = await api.post("/order-api/menu", {
        ...newDish,
        disponible: true,
      });
      if (res.status === 201 || res.data?.id) {
        setMessage("✅ Plat ajouté !");
        setNewDish({ nom: "", description: "", prix: 0, categorie: "PLAT_PRINCIPAL" });
        fetchMenu();
      } else {
        setMessage("❌ Erreur lors de l'ajout du plat");
      }
    } catch {
      setMessage("❌ Erreur lors de l'ajout du plat");
    }
  };

  const createLivraison = async (order) => {
    try {
      const res = await api.post("/delivery-api/livraisons", {
        commandeId: order.id,
        adresseDepart: "Restaurant ABC, Paris",
        adresseArrivee: order.adresse,
        clientNom: "Client",
        clientTelephone: order.telephone,
        prixLivraison: 5,
        distanceKm: 2.5,
        tempsEstime: 20,
        commentaires: "Livraison standard"
      });

      if (res.status === 201) {
        setMessage(`✅ Livraison créée pour commande ${order.id}`);
        fetchOrders();
      } else {
        setMessage("❌ Erreur inattendue lors de la création");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setMessage(`⚠ Livraison déjà existante pour commande ${order.id}`);
      } else {
        setMessage("❌ Erreur lors de la création de la livraison");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "EN_PREPARATION":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PRETE":
        return "bg-green-100 text-green-800 border-green-200";
      case "LIVREE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "ANNULEE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "EN_ATTENTE":
        return "⏳";
      case "EN_PREPARATION":
        return "👨‍🍳";
      case "PRETE":
        return "✅";
      case "LIVREE":
        return "🚚";
      case "ANNULEE":
        return "❌";
      default:
        return "📋";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Header />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">👨‍🍳</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Tableau de bord cuisine
          </h1>
          <p className="text-gray-600 text-lg">
            Gérez vos commandes et votre menu en temps réel
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Orders Section */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="mr-3 text-3xl">🧾</span>
                  Commandes actives
                </h2>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {orders.length} commande{orders.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          #
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 truncate">Commande #{order.id}</h3>
                          <p className="text-sm text-gray-500 truncate">ID: {order.id}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium border flex-shrink-0 ${getStatusColor(order.status)}`}>
                        <span className="mr-2">{getStatusIcon(order.status)}</span>
                        {order.status}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">📍</span>
                          <span className="text-gray-700">{order.adresse}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">📞</span>
                          <span className="text-gray-700">{order.telephone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <span className="mr-2">🍽️</span>
                        Articles commandés
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => {
                          const plat = menu.find((p) => p.id === item.menuId);
                          return (
                            <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                              <span className="text-gray-800">
                                {plat ? plat.nom : "Plat inconnu"}
                              </span>
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                                × {item.quantite}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      {order.status === "EN_ATTENTE" && (
                        <button
                          onClick={() => updateStatus(order.id, "EN_PREPARATION")}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <span className="mr-2">🚀</span>
                          Commencer préparation
                        </button>
                      )}

                      {order.status === "EN_PREPARATION" && (
                        <button
                          onClick={() => updateStatus(order.id, "PRETE")}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <span className="mr-2">✅</span>
                          Marquer comme prête
                        </button>
                      )}

                      {order.status === "PRETE" && (
                        <button
                          onClick={() => createLivraison(order)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <span className="mr-2">🚚</span>
                          Affecter à un livreur
                        </button>
                      )}

                      {order.status !== "LIVREE" && order.status !== "ANNULEE" && (
                        <button
                          onClick={() => updateStatus(order.id, "ANNULEE")}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <span className="mr-2">❌</span>
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Dish Section */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
                  <span className="text-2xl">➕</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Ajouter un plat
                </h2>
                <p className="text-gray-600">
                  Enrichissez votre menu avec de nouveaux plats
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du plat
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Ex: Risotto aux champignons"
                    value={newDish.nom}
                    onChange={(e) => setNewDish({ ...newDish, nom: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Décrivez votre plat..."
                    value={newDish.description}
                    onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€)
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                    type="number"
                    value={newDish.prix}
                    onChange={(e) =>
                      setNewDish({ ...newDish, prix: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    value={newDish.categorie}
                    onChange={(e) => setNewDish({ ...newDish, categorie: e.target.value })}
                  >
                    <option value="ENTREE">🥗 Entrée</option>
                    <option value="PLAT_PRINCIPAL">🍽️ Plat Principal</option>
                    <option value="DESSERT">🍰 Dessert</option>
                    <option value="BOISSON">🥤 Boisson</option>
                  </select>
                </div>

                <button
                  onClick={handleAddDish}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
                >
                  <span className="mr-2">✨</span>
                  Ajouter au menu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {(message || error) && (
          <div
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl transition-all duration-500 z-50 flex items-center space-x-3 ${
              message?.startsWith("✅") 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex-shrink-0">
              {message?.startsWith("✅") ? (
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              ) : (
                <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
              )}
            </div>
            <span className="font-medium">{message || error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
