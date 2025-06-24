import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import Header from "../components/Header"; 


export default function Livreur() {
  const [deliveries, setDeliveries] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDeliveries = async () => {
    try {
      const res = await api.get("/delivery/assigned");
      setDeliveries(res.data);
    } catch (err) {
      setError("Erreur : service livraison indisponible");
    }
  };

  const updateDelivery = async () => {
    try {
      const res = await api.post("/delivery/update");
      if (res.data.status) {
        setMessage(`Commande ${res.data.order_id} marquée comme "${res.data.status}"`);
        fetchDeliveries();
      } else {
        setMessage("Erreur lors de la mise à jour");
      }
    } catch (err) {
      setMessage("Erreur : mise à jour échouée");
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
        <div>
      <Header /> {/* Ajout du header */}
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Commandes à livrer</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="space-y-2">
        {deliveries.map((d) => (
          <li
            key={d.order_id}
            className="p-3 border rounded bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">Commande : {d.order_id}</p>
              <p className="text-sm text-gray-600">Livreur : {d.livreur}</p>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={updateDelivery}
        className="mt-6 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
      >
        Marquer comme livrée
      </button>

      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
    </div>
    </div>
  );
}
