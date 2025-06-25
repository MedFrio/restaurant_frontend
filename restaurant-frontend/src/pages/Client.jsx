import { useState, useEffect } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function Client() {
  const { token, clientId } = useAuth();
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("Tous");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/order-api/menu")
      .then((res) => {
        const platsDisponibles = res.data.filter((item) => item.disponible !== false);
        setMenu(platsDisponibles);
        const uniqueCategories = ["Tous", ...new Set(platsDisponibles.map(p => p.categorie))];
        setCategories(uniqueCategories);
      })
      .catch(() => setError("Erreur de connexion au service Menu"));
  }, []);

  useEffect(() => {
    if (clientId) {
      api.get(`/client-api/clients/${clientId}`)
        .then((res) => setClientInfo(res.data))
        .catch(() => setError("Impossible de récupérer les infos client"));
    }
  }, [clientId]);

  const addItem = (item) => {
    const existing = selectedItems.find((i) => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.id === item.id ? { ...i, quantite: i.quantite + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantite: 1 }]);
    }
  };

  const removeItem = (item) => {
    const existing = selectedItems.find((i) => i.id === item.id);
    if (existing?.quantite > 1) {
      setSelectedItems(selectedItems.map(i => i.id === item.id ? { ...i, quantite: i.quantite - 1 } : i));
    } else {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    }
  };

  const sendOrder = async () => {
    if (!selectedItems.length) return setMessage("Veuillez sélectionner au moins un plat.");
    if (!clientInfo) return setMessage("Informations client manquantes");

    const items = selectedItems.map((item) => ({
      menuId: item.id,
      quantite: item.quantite,
    }));

    try {
      const res = await api.post(
        "/order-api/commandes",
        {
          clientId,
          items,
          adresse: clientInfo.address,
          telephone: clientInfo.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.id) {
        setMessage(`✅ Commande envoyée ! ID : ${res.data.id}`);
        setSelectedItems([]);
      } else {
        setMessage("❌ Échec de la commande.");
      }
    } catch {
      setMessage("❌ Service commande indisponible.");
    }
  };

  const total = selectedItems.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  const filteredMenu = filter === "Tous" ? menu : menu.filter((item) => item.categorie === filter);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="p-6 max-w-2xl mx-auto text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-800">🍽️ Menu du jour</h1>
          <button
            onClick={() => navigate("/mes-commandes")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-sm"
          >
            Mes Commandes
          </button>
        </div>

        {clientInfo && (
          <div className="mb-4 text-sm bg-indigo-50 p-3 rounded border border-indigo-200">
            <strong>👤 {clientInfo.firstName} {clientInfo.lastName}</strong><br />
            📍 {clientInfo.address}, {clientInfo.city} {clientInfo.postalCode}<br />
            📞 {clientInfo.phone}
          </div>
        )}

        {categories.length > 1 && (
          <div className="mb-4">
            <label className="mr-2 text-gray-700">Filtrer par catégorie :</label>
            <select onChange={(e) => setFilter(e.target.value)} className="border p-1 rounded bg-white">
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <ul className="space-y-3">
          {filteredMenu.map((item) => {
            const selected = selectedItems.find((i) => i.id === item.id);
            return (
              <li
                key={item.id}
                className={`p-4 border rounded bg-white shadow-sm ${
                  selected ? "border-green-400 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.nom} - {item.prix} €</p>
                    <p className="text-sm text-gray-600 italic">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected && (
                      <>
                        <button
                          onClick={() => removeItem(item)}
                          className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                        >
                          –
                        </button>
                        <span>{selected.quantite}</span>
                      </>
                    )}
                    <button
                      onClick={() => addItem(item)}
                      className="bg-green-500 text-white px-2 rounded hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {selectedItems.length > 0 && (
          <div className="mt-6 text-right text-lg font-medium text-gray-800">
            Total : {total.toFixed(2)} €
          </div>
        )}

        <button
          onClick={sendOrder}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Passer la commande
        </button>

        {message && <p className="mt-4 text-center text-green-700">{message}</p>}
      </div>
    </div>
  );
}
