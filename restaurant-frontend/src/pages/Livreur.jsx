import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

export default function Livreur() {
  const { clientId } = useAuth();
  const [livreurId, setLivreurId] = useState(() => localStorage.getItem("livreurId"));
  const [livraisons, setLivraisons] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initLivreur = async () => {
      try {
        if (livreurId) {
          try {
            await api.get(`/delivery-api/livreurs/${livreurId}`);
            return;
          } catch {
            localStorage.removeItem("livreurId");
            setLivreurId(null);
          }
        }

        let clientInfo = null;
        try {
          const resClient = await api.get(`/client-api/clients/${clientId}`);
          clientInfo = resClient.data;
        } catch (err) {
          console.error("❌ Impossible de récupérer le client:", err);
          setError("❌ Erreur: client introuvable.");
          return;
        }

        console.log("✅ Client trouvé:", clientInfo);

        const livreurData = {
          nom: clientInfo.firstName,
          prenom: clientInfo.lastName,
          telephone: clientInfo.phone,
          email: clientInfo.email,
          motDePasse: "secret",
          vehicule: "Scooter",
          numeroLicence: "AUTO-GEN",
          adresse: clientInfo.address,
          ville: clientInfo.city,
          codePostal: clientInfo.postalCode
        };

        // ==================================================
        // Essai de création avec boucle de retries
        // ==================================================
        let success = false;
        let attempts = 0;

        while (!success && attempts < 3) {
          attempts++;
          console.log(`🚀 Tentative #${attempts} pour créer le livreur`);

          try {
            const createRes = await api.post("/delivery-api/livreurs", livreurData);
            console.log(`✅ Livreur créé avec ID ${createRes.data.id}`);
            localStorage.setItem("livreurId", createRes.data.id);
            setLivreurId(createRes.data.id);
            success = true;
          } catch (err) {
            if (err.response && err.response.status === 409) {
              console.warn("⚠️ Livreur déjà existant, suppression puis retry");

              const livs = await api.get("/delivery-api/livreurs");
              const existing = livs.data.find(l => l.email === clientInfo.email);

              if (existing) {
                await api.delete(`/delivery-api/livreurs/${existing.id}`);
                console.log(`✅ Ancien livreur ${existing.id} supprimé`);
              } else {
                console.error("❌ Conflit: livreur existe mais introuvable");
                break;
              }

              await new Promise(resolve => setTimeout(resolve, 1000));
            } else if (err.response && err.response.status === 500) {
              console.warn("⚠️ Erreur serveur, retry dans 1s");
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              console.error("❌ Erreur création livreur:", err);
              break;
            }
          }
        }

        if (!success) {
          console.error("❌ Impossible de créer le livreur même après retries, on recharge la page.");
          window.location.reload();
        }

      } catch (err) {
        console.error("Erreur initLivreur:", err);
        setError(`❌ Erreur init livreur: ${err?.response?.data?.message || err.message || "Erreur inconnue"}`);
      }
    };

    initLivreur();
  }, [clientId, livreurId]);

  const fetchLivraisons = async () => {
    if (!livreurId) return;
    try {
      const res = await api.get(`/delivery-api/livraisons?livreurId=${livreurId}`);
      setLivraisons(res.data);
    } catch {
      setError("Impossible de charger les livraisons");
    }
  };

  const updateLivraison = async (id, newStatus) => {
    try {
      const res = await api.patch(`/delivery-api/livraisons/${id}`, {
        statut: newStatus,
        livreurId,
      });
      if (res.status === 200) {
        setMessage(`✅ Livraison ${id} → ${newStatus}`);
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
                      onClick={() => updateLivraison(liv.id, "LIVREE")}
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
