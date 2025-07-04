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
      fetchOrders(); // <-- recharge les commandes
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="p-6 max-w-5xl mx-auto text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-yellow-700">👨‍🍳 Tableau de bord cuisine</h1>

        {/* Liste des commandes */}
        <ul className="space-y-4 mb-10">
          {orders.map((order) => (
            <li key={order.id} className="bg-white p-4 border rounded shadow-sm">
              <div className="mb-2 flex justify-between items-center">
                <span className="font-semibold text-gray-800">🧾 Commande #{order.id}</span>
                <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  Statut : {order.status}
                </span>
              </div>

              <div className="text-sm text-gray-700 mb-2">
                📍 {order.adresse} — 📞 {order.telephone}
              </div>

              <ul className="text-sm text-gray-700 mb-2 ml-4 list-disc">
                {order.items?.map((item, idx) => {
                  const plat = menu.find((p) => p.id === item.menuId);
                  return (
                    <li key={idx}>
                      {plat ? plat.nom : "Plat inconnu"} × {item.quantite}
                    </li>
                  );
                })}
              </ul>

              <div className="flex gap-2 mt-2 flex-wrap">
                {order.status === "EN_ATTENTE" && (
                  <button
                    onClick={() => updateStatus(order.id, "EN_PREPARATION")}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Commencer préparation
                  </button>
                )}

                {order.status === "EN_PREPARATION" && (
                  <button
                    onClick={() => updateStatus(order.id, "PRETE")}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Marquer comme prête
                  </button>
                )}

                {order.status === "PRETE" && (
                  <button
                    onClick={() => createLivraison(order)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Affecter à un livreur
                  </button>
                )}

                {order.status !== "LIVREE" && order.status !== "ANNULEE" && (
                  <button
                    onClick={() => updateStatus(order.id, "ANNULEE")}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

{(message || error) && (
  <div
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg transition-all duration-500
      ${message?.startsWith("✅") ? "bg-green-500 text-white" :
      message || error ? "bg-red-500 text-white" : ""}`
    }
    style={{ zIndex: 1000 }}
  >
    {message || error}
  </div>
)}


        {/* Ajouter un plat */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">➕ Ajouter un plat</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="p-2 border rounded bg-white text-black placeholder:text-gray-500"
              placeholder="Nom"
              value={newDish.nom}
              onChange={(e) => setNewDish({ ...newDish, nom: e.target.value })}
            />
            <input
              className="p-2 border rounded bg-white text-black placeholder:text-gray-500"
              placeholder="Description"
              value={newDish.description}
              onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
            />
            <input
              className="p-2 border rounded bg-white text-black placeholder:text-gray-500"
              placeholder="Prix"
              type="number"
              value={newDish.prix}
              onChange={(e) =>
                setNewDish({ ...newDish, prix: parseFloat(e.target.value) || 0 })
              }
            />
            <select
              className="p-2 border rounded bg-white text-black"
              value={newDish.categorie}
              onChange={(e) => setNewDish({ ...newDish, categorie: e.target.value })}
            >
              <option value="ENTREE">Entrée</option>
              <option value="PLAT_PRINCIPAL">Plat Principal</option>
              <option value="DESSERT">Dessert</option>
              <option value="BOISSON">Boisson</option>
            </select>
          </div>
          <button
            onClick={handleAddDish}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ajouter
          </button>
        </section>
      </div>
    </div>
  );
}
