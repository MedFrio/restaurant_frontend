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
  const [isLoadingMenu, setIsLoadingMenu] = useState(true); // New loading state for menu
  const [isLoadingClientInfo, setIsLoadingClientInfo] = useState(true); // New loading state for client info

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoadingMenu(true);
    api.get("/order-api/menu")
      .then((res) => {
        const platsDisponibles = res.data.filter((item) => item.disponible !== false);
        setMenu(platsDisponibles);
        const uniqueCategories = ["Tous", ...new Set(platsDisponibles.map(p => p.categorie))];
        setCategories(uniqueCategories);
      })
      .catch(() => setError("Erreur de connexion au service Menu. Veuillez réessayer plus tard."))
      .finally(() => setIsLoadingMenu(false));
  }, []);

  useEffect(() => {
    if (clientId) {
      setIsLoadingClientInfo(true);
      api.get(`/client-api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setClientInfo(res.data))
        .catch(() => setError("Impossible de récupérer vos informations client."))
        .finally(() => setIsLoadingClientInfo(false));
    }
  }, [clientId, token]);

  const addItem = (item) => {
    const existing = selectedItems.find((i) => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.id === item.id ? { ...i, quantite: i.quantite + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantite: 1 }]);
    }
    setMessage(""); // Clear message on item change
  };

  const removeItem = (item) => {
    const existing = selectedItems.find((i) => i.id === item.id);
    if (existing?.quantite > 1) {
      setSelectedItems(selectedItems.map(i => i.id === item.id ? { ...i, quantite: i.quantite - 1 } : i));
    } else {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    }
    setMessage(""); // Clear message on item change
  };

  const sendOrder = async () => {
    setMessage(""); // Clear previous messages
    setError(""); // Clear previous errors

    if (!selectedItems.length) {
      setMessage("Veuillez ajouter au moins un plat à votre panier.");
      return;
    }
    if (!clientInfo) {
      setMessage("Vos informations de livraison sont manquantes. Impossible de passer commande.");
      return;
    }

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
        setMessage(`🎉 Votre commande #${res.data.id} a été envoyée avec succès !`);
        setSelectedItems([]); // Clear cart after successful order
      } else {
        setMessage("❌ Un problème est survenu lors de l'envoi de votre commande. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi de la commande :", err);
      setMessage("❌ Service de commande actuellement indisponible. Veuillez nous excuser.");
    }
  };

  const total = selectedItems.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  const filteredMenu = filter === "Tous" ? menu : menu.filter((item) => item.categorie === filter);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-4xl font-extrabold text-indigo-800 mb-4 md:mb-0 flex items-center">
              <span className="mr-3 text-5xl">🍔</span> Commandez Facilement
            </h1>
            <button
              onClick={() => navigate("/mes-commandes")}
              className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center"
            >
              <span className="mr-2 text-xl">📋</span> Mes Commandes
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold mr-2">Oups !</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div className={`px-4 py-3 rounded-lg relative mb-6 ${message.startsWith('✅') || message.startsWith('🎉') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-yellow-100 border border-yellow-400 text-yellow-700'}`} role="alert">
              <strong className="font-bold mr-2">{message.startsWith('✅') || message.startsWith('🎉') ? 'Succès !' : 'Info :'}</strong>
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          {isLoadingClientInfo ? (
            <div className="text-center py-4">
              <p className="text-lg text-gray-600 mb-2">Chargement de vos informations client...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : clientInfo ? (
            <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                  <span className="mr-2 text-2xl">👋</span> Bonjour, {clientInfo.firstName} {clientInfo.lastName} !
                </p>
                <p className="text-md text-gray-700 flex items-center">
                  <span className="mr-2 text-lg">📍</span> Livraison à : {clientInfo.address}, {clientInfo.postalCode} {clientInfo.city}
                </p>
                <p className="text-md text-gray-700 flex items-center">
                  <span className="mr-2 text-lg">📞</span> Téléphone : {clientInfo.phone}
                </p>
              </div>
              {/* Optional: Add an "Edit Info" button here if functionality exists */}
            </div>
          ) : (
            <div className="mb-8 p-5 bg-red-50 rounded-xl border border-red-200 shadow-sm text-red-700">
              <p className="font-semibold mb-2">Impossible de charger vos informations client.</p>
              <p>Veuillez vous assurer que vous êtes connecté ou contactez le support.</p>
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-4xl">📚</span> Notre Menu Gourmand
          </h2>

          {categories.length > 1 && (
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <label htmlFor="category-filter" className="text-lg font-medium text-gray-700">
                Filtrer par catégorie :
              </label>
              <div className="relative">
                <select
                  id="category-filter"
                  onChange={(e) => setFilter(e.target.value)}
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {isLoadingMenu ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600 mb-4">Chargement du menu...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : filteredMenu.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMenu.map((item) => {
                const selected = selectedItems.find((i) => i.id === item.id);
                const quantity = selected ? selected.quantite : 0;
                return (
                  <li
                    key={item.id}
                    className={`p-6 border rounded-xl bg-white shadow-lg flex flex-col justify-between transform transition-all duration-300 ease-in-out ${
                      selected ? "border-green-500 ring-2 ring-green-300" : "border-gray-200 hover:shadow-xl hover:border-blue-300"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">{item.nom}</h3>
                      <p className="text-md text-gray-600 mb-3">{item.description}</p>
                      <p className="font-semibold text-indigo-700 text-lg mb-4">{item.prix.toFixed(2)} €</p>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-auto">
                      {quantity > 0 && (
                        <button
                          onClick={() => removeItem(item)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                          aria-label={`Retirer un ${item.nom}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      {quantity > 0 && (
                        <span className="font-bold text-xl text-gray-900 min-w-[20px] text-center">{quantity}</span>
                      )}
                      <button
                        onClick={() => addItem(item)}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                        aria-label={`Ajouter un ${item.nom}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg shadow-inner">
              <p className="text-xl text-gray-700">Aucun plat disponible pour cette catégorie.</p>
              <p className="text-md text-gray-500 mt-2">Veuillez ajuster le filtre ou vérifier plus tard.</p>
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-xl shadow-md border border-indigo-200">
              <h3 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <span className="mr-2 text-3xl">🛒</span> Votre Panier
              </h3>
              <ul className="space-y-3 mb-4">
                {selectedItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center text-lg text-gray-800">
                    <span>{item.nom} x {item.quantite}</span>
                    <span className="font-semibold">{(item.prix * item.quantite).toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center text-2xl font-bold text-gray-900 border-t pt-4 border-gray-300">
                <span>Total à payer :</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          )}

          <button
            onClick={sendOrder}
            disabled={!selectedItems.length || !clientInfo} // Disable if no items or no client info
            className={`mt-8 w-full py-4 rounded-xl text-xl font-bold transition-all duration-300 ease-in-out shadow-lg ${
              !selectedItems.length || !clientInfo
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
            } flex items-center justify-center`}
          >
            <span className="mr-3 text-2xl">🚀</span> Envoyer ma commande
          </button>
        </div>
      </div>
    </div>
  );
}
