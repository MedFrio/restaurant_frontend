import { useState, useEffect } from "react";
import { api } from "../api/axiosInstance";

export default function Client() {
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Récupération du menu depuis l'API Gateway
    api.get("/menu")
      .then((res) => {
        if (res.data.menu) {
          setMenu(res.data.menu);
        } else {
          setError("Aucun menu trouvé");
        }
      })
      .catch(() => setError("Service indisponible"));
  }, []);

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

    try {
      const res = await api.post("/orders", {
        client_id: "123", // ou récupérer dynamiquement selon session
        items: selectedItems,
      });
      if (res.data.order_id) {
        setMessage(`Commande envoyée ! ID: ${res.data.order_id}`);
        setSelectedItems([]);
      } else {
        setMessage("Erreur lors de la création de la commande");
      }
    } catch {
      setMessage("Erreur : le service commande est indisponible");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Menu du jour</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <ul className="space-y-2">
        {menu.map((item) => (
          <li
            key={item}
            className={`flex justify-between items-center p-3 border rounded ${
              selectedItems.includes(item)
                ? "bg-green-100 border-green-400"
                : "bg-white"
            }`}
          >
            <span>{item}</span>
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
  );
}
