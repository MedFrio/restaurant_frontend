import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import Header from "../components/Header";

export default function Admin() {
  const [clients, setClients] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClients();
    fetchMenu();
    fetchOrders();
    fetchLivraisons();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get("/client-api/clients");
      setClients(res.data);
    } catch {
      setError("Impossible de charger les utilisateurs.");
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await api.get("/order-api/menu");
      setMenu(res.data);
    } catch {
      setError("Impossible de charger les plats.");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order-api/commandes");
      setOrders(res.data);
    } catch {
      setError("Impossible de charger les commandes.");
    }
  };

  const fetchLivraisons = async () => {
    try {
      const res = await api.get("/delivery-api/livraisons");
      setLivraisons(res.data);
    } catch {
      setError("Impossible de charger les livraisons.");
    }
  };

  const supprimerClient = async (id) => {
    try {
      await api.delete(`/client-api/clients/${id}`);
      setClients(clients.filter(c => c.id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="p-6 max-w-6xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">🛠️ Tableau de bord Admin</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* UTILISATEURS */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">👤 Utilisateurs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="p-2 border">Nom</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Téléphone</th>
                  <th className="p-2 border">Rôle</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(user => (
                  <tr key={user.id} className="text-sm">
                    <td className="p-2 border">{user.firstName} {user.lastName}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border">{user.phone}</td>
                    <td className="p-2 border capitalize">{user.role}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => supprimerClient(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* MENU */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">🍽️ Plats du menu</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="p-2 border">Nom</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Prix</th>
                  <th className="p-2 border">Catégorie</th>
                  <th className="p-2 border">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {menu.map(plat => (
                  <tr key={plat.id} className="text-sm">
                    <td className="p-2 border">{plat.nom}</td>
                    <td className="p-2 border">{plat.description}</td>
                    <td className="p-2 border">{plat.prix} €</td>
                    <td className="p-2 border">{plat.categorie}</td>
                    <td className={`p-2 border ${plat.disponible ? "text-green-600" : "text-red-600"}`}>
                      {plat.disponible ? "Oui" : "Non"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* COMMANDES */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">🧾 Commandes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Adresse</th>
                  <th className="p-2 border">Téléphone</th>
                  <th className="p-2 border">Statut</th>
                  <th className="p-2 border">Plats</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="text-sm">
                    <td className="p-2 border">{order.id}</td>
                    <td className="p-2 border">{order.adresse}</td>
                    <td className="p-2 border">{order.telephone}</td>
                    <td className="p-2 border">{order.status}</td>
                    <td className="p-2 border">
                      <ul className="list-disc ml-4">
                        {order.items?.map((item, idx) => {
                          const plat = menu.find(p => p.id === item.menuId);
                          return <li key={idx}>{plat ? plat.nom : "Plat inconnu"} × {item.quantite}</li>;
                        })}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* LIVRAISONS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">🚚 Livraisons</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Statut</th>
                  <th className="p-2 border">Client</th>
                  <th className="p-2 border">Adresse Départ</th>
                  <th className="p-2 border">Adresse Arrivée</th>
                </tr>
              </thead>
              <tbody>
                {livraisons.map(liv => (
                  <tr key={liv.id} className="text-sm">
                    <td className="p-2 border">{liv.id}</td>
                    <td className={`p-2 border ${liv.statut === "LIVREE" ? "text-green-600" : "text-yellow-700"}`}>{liv.statut}</td>
                    <td className="p-2 border">{liv.clientNom} ({liv.clientTelephone})</td>
                    <td className="p-2 border">{liv.adresseDepart}</td>
                    <td className="p-2 border">{liv.adresseArrivee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
