import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import Header from "../components/Header"; 


export default function Chef() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await api.get("/kitchen/orders");
      setOrders(res.data);
    } catch (err) {
      setError("Impossible de récupérer les commandes (cuisine indisponible)");
    }
  };

  const updateOrder = async () => {
    try {
      const res = await api.post("/kitchen/update");
      if (res.data.status) {
        setMessage(`Commande ${res.data.order_id} marquée comme "${res.data.status}"`);
        fetchOrders(); // rafraîchir
      } else {
        setMessage("Erreur lors de la mise à jour");
      }
    } catch (err) {
      setMessage("Erreur : service cuisine indisponible");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
        <div>
      <Header /> {/* Ajout du header */}
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord cuisine</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.order_id}
            className="p-3 border rounded bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">Commande : {order.order_id}</p>
              <p className="text-sm text-gray-600">Statut : {order.status}</p>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={updateOrder}
        className="mt-6 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
      >
        Marquer une commande comme prête
      </button>

      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
    </div>
    </div>
  );
}
