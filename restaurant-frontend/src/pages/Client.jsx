import { useState, useEffect } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header"; 

export default function Client() {
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token, clientId } = useAuth();
  const [clientInfo, setClientInfo] = useState(null);



  // Récupération du menu
  useEffect(() => {
    api.get("/order-api/menu")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMenu(res.data);
        } else {
          setError("Menu introuvable");
        }
      })
      .catch(() => setError("Erreur de connexion au service Menu"));
  }, []);

  // Récupération des infos client
  useEffect(() => {
    if (clientId) {
      api.get(`/client-api/clients/${clientId}`)
        .then((res) => setClientInfo(res.data))
        .catch(() => setError("Impossible de récupérer les infos client"));
    }
  }, [clientId]);

  const toggleItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const sendOrder = async () => {
    if (selectedItems.length === 0) {
      setMessage("Veuillez sélectionner au moins un plat.");
      return;
    }

    if (!clientInfo) {
      setMessage("Informations client manquantes");
      return;
    }

    const items = selectedItems.map((item) => ({
      menuId: item.id,
      quantite: 1,
    }));

    try {
      const res = await api.post(
        "/order-api/commandes",
        {
          clientId,
          items,
          adresse: clientInfo.address,
          telephone: clientInfo.phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.id) {
        setMessage(`Commande envoyée ! ID : ${res.data.id}`);
        setSelectedItems([]);
      } else {
        setMessage("Échec de la commande.");
      }
    } catch {
      setMessage("Service commande indisponible.");
    }
  };

  return (
    <div>
      <Header /> {/* Ajout du header */}
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Menu du jour</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <ul className="space-y-2">
        {menu.map((item) => (
          <li
            key={item.id}
            className={`flex justify-between items-center p-3 border rounded text-gray-900 ${
              selectedItems.includes(item)
                ? "bg-green-100 border-green-400"
                : "bg-white"
            }`}
          >
            <span>{item.nom} - {item.prix} €</span>

            <button
              onClick={() => toggleItem(item)}
              className="text-sm text-blue-600 underline"
            >
              {selectedItems.includes(item) ? "Retirer" : "Ajouter"}
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={sendOrder}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Passer la commande
      </button>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
    </div>
  );
}
