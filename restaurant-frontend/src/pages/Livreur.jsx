import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

export default function Livreur() {
  const { clientId, token, firstName } = useAuth();
  const [livreurId, setLivreurId] = useState(() => localStorage.getItem("livreurId"));
  const [livraisons, setLivraisons] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Charger ou créer le livreur au montage
  useEffect(() => {
    const initLivreur = async () => {
      try {
        if (livreurId) return;

        const res = await api.get("/delivery-api/livreurs");
        const existing = res.data.find(l => l.email === `${clientId}@delivery.com`);
        if (existing) {
          localStorage.setItem("livreurId", existing.id);
          setLivreurId(existing.id);
          return;
        }

        const createRes = await api.post("/delivery-api/livreurs", {
          nom: firstName || "Livreur",
          prenom: "App",
          telephone: "+33123456789",
          email: `${clientId}@delivery.com`,
          motDePasse: "secret",
          vehicule: "Scooter",
          numeroLicence: "AUTO-GEN",
          adresse: "Depot",
          ville: "Ville",
          codePostal: "00000"
        });

        localStorage.setItem("livreurId", createRes.data.id);
        setLivreurId(createRes.data.id);
      } catch (err) {
        setError("❌ Erreur lors de l'initialisation du livreur");
      }
    };

    initLivreur();
  }, [clientId, livreurId, firstName]);

  const fetchLivraisons = async () => {
    if (!livreurId) return;
    try {
      const res = await api.get(`/delivery-api/livraisons?livreurId=${livreurId}`);
      setLivraisons(res.data);
    } catch {
      setError("Impossible de charger les livraisons");
    }
  };

  const updateLivraison = async (id, newStatus, commandeId = null) => {
    try {
      const res = await api.patch(`/delivery-api/livraisons/${id}`, {
        statut: newStatus,
        livreurId,
      });

      if (res.status === 200) {
        setMessage(`✅ Livraison ${id} → ${newStatus}`);

        // Si la livraison est marquée livrée, notifier la commande
        if (newStatus === "LIVREE" && commandeId) {
          try {
            await api.patch(`/order-api/commandes/${commandeId}/status`, {
              status: "LIVREE",
            });
            setMessage(`✅ Livraison et commande ${commandeId} marquées LIVREE`);
          } catch {
            setMessage("⚠ Livraison OK mais échec MAJ commande");
          }
        }

        fetchLivraisons();
      } else {
        setMessage("❌ Erreur lors de la mise à jour");
      }
    } catch {
      setMessage("❌ Erreur réseau");
    }
  };

  const cancelLivraison = (id) => updateLivraison(id, "ANNULEE");

  useEffect(() => {
    fetchLivraisons();
  }, [livreurId]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="p-6 max-w-3xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-green-700">🚚 Mes livraisons</h1>

        {livraisons.length === 0 ? (
          <p className="text-gray-600">Aucune livraison pour l’instant.</p>
        ) : (
          <div className="space-y-6">
            {livraisons.map((liv) => (
              <div key={liv.id} className="bg-white p-4 border rounded shadow-sm">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Livraison #{liv.id}</span>
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                    Statut : {liv.statut}
                  </span>
                </div>

                <div className="text-sm text-gray-700 mb-2">
                  🏠 De : {liv.adresseDepart}<br />
                  🚪 À : {liv.adresseArrivee}<br />
                  📞 Client : {liv.clientNom} ({liv.clientTelephone})<br />
                  💬 {liv.commentaires}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {liv.statut === "EN_ATTENTE" && (
                    <button
                      onClick={() => updateLivraison(liv.id, "EN_ROUTE_RESTAURANT")}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Prendre la livraison
                    </button>
                  )}
                  {liv.statut === "EN_ROUTE_RESTAURANT" && (
                    <button
                      onClick={() => updateLivraison(liv.id, "RECUPEREE")}
                      className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      Marquer comme récupérée
                    </button>
                  )}
                  {liv.statut === "RECUPEREE" && (
                    <button
                      onClick={() => updateLivraison(liv.id, "EN_ROUTE_CLIENT")}
                      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >
                      Livrer au client
                    </button>
                  )}
                  {liv.statut === "EN_ROUTE_CLIENT" && (
                    <button
                      onClick={() => updateLivraison(liv.id, "LIVREE", liv.commandeId)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Marquer comme livrée
                    </button>
                  )}

                  {liv.statut !== "LIVREE" && liv.statut !== "ANNULEE" && (
                    <button
                      onClick={() => cancelLivraison(liv.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(message || error) && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg transition-all duration-500
            ${message.startsWith("✅") ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
            style={{ zIndex: 1000 }}
          >
            {message || error}
          </div>
        )}
      </div>
    </div>
  );
}
