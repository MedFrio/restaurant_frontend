import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function MesCommandes() {
  const { clientId, token } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [menuMap, setMenuMap] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Charger tous les plats pour faire une map id -> nom
    api.get("/order-api/menu")
      .then((res) => {
        const map = {};
        res.data.forEach(item => {
          map[item.id] = item.nom;
        });
        setMenuMap(map);
      })
      .catch(() => console.error("Impossible de charger le menu"));
  }, []);

  useEffect(() => {
    if (clientId) {
      api.get("/order-api/commandes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          const mesCommandes = res.data.filter(cmd => cmd.clientId === clientId);
          setCommandes(mesCommandes);
        })
        .catch(() => setError("Impossible de charger les commandes"));
    }
  }, [clientId, token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="p-6 max-w-3xl mx-auto text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-800">🧾 Mes commandes</h1>
          <button
            onClick={() => navigate("/client")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-sm"
          >
            Commander à nouveau
          </button>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {commandes.length === 0 ? (
          <p className="text-gray-600">Aucune commande trouvée.</p>
        ) : (
          <div className="space-y-6">
            {commandes.map((commande) => (
              <div key={commande.id} className="bg-white p-4 border rounded shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">
                    Commande #{commande.id}
                  </span>
                  <span className="text-sm px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                    Statut : {commande.status}
                  </span>
                </div>

                <div className="text-sm text-gray-700 mb-2">
                  📍 {commande.adresse} — 📞 {commande.telephone}
                </div>

                <ul className="mt-2 space-y-1 text-gray-700">
                  {commande.items?.map((item, idx) => (
                    <li key={idx} className="ml-2">
                      • {menuMap[item.menuId] || "Plat inconnu"} × {item.quantite}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
