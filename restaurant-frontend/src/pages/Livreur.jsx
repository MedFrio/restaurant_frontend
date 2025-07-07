import { useEffect, useState, useCallback } from "react";
import { api } from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

export default function Livreur() {
  const { clientId } = useAuth();
  const [livreurId, setLivreurId] = useState(null);
  const [livraisons, setLivraisons] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fonction pour attendre un délai
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fonction pour récupérer ou créer le livreur
  const initLivreur = useCallback(async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError("");
    
    try {
      // 1. Vérifier si on a déjà un livreurId en localStorage
      const storedLivreurId = localStorage.getItem("livreurId");
      if (storedLivreurId) {
        try {
          await api.get(`/delivery-api/livreurs/${storedLivreurId}`);
          console.log("✅ Livreur existant trouvé:", storedLivreurId);
          setLivreurId(storedLivreurId);
          return;
        } catch (err) {
          console.log("❌ Livreur stocké invalide, suppression du localStorage");
          localStorage.removeItem("livreurId");
        }
      }

      // 2. Récupérer les infos du client
      console.log("📋 Récupération du client:", clientId);
      const resClient = await api.get(`/client-api/clients/${clientId}`);
      const clientInfo = resClient.data;
      console.log("✅ Client trouvé:", clientInfo);

      // 3. Vérifier si un livreur existe déjà avec cet email
      console.log("🔍 Vérification livreur existant avec email:", clientInfo.email);
      const existingLivreurs = await api.get("/delivery-api/livreurs");
      const existingLivreur = existingLivreurs.data.find(l => l.email === clientInfo.email);

      if (existingLivreur) {
        console.log("✅ Livreur existant trouvé:", existingLivreur.id);
        localStorage.setItem("livreurId", existingLivreur.id.toString());
        setLivreurId(existingLivreur.id.toString());
        return;
      }

      // 4. Créer un nouveau livreur
      console.log("🚀 Création d'un nouveau livreur");
      const livreurData = {
        nom: clientInfo.firstName,
        prenom: clientInfo.lastName,
        telephone: clientInfo.phone,
        email: clientInfo.email,
        motDePasse: `pwd_${Date.now()}`, // Mot de passe unique
        vehicule: "Scooter",
        numeroLicence: `LIC_${Date.now()}`, // Numéro unique
        adresse: clientInfo.address,
        ville: clientInfo.city,
        codePostal: clientInfo.postalCode
      };

      const createRes = await api.post("/delivery-api/livreurs", livreurData);
      console.log("✅ Nouveau livreur créé:", createRes.data.id);
      
      localStorage.setItem("livreurId", createRes.data.id.toString());
      setLivreurId(createRes.data.id.toString());

    } catch (err) {
      console.error("❌ Erreur lors de l'initialisation du livreur:", err);
      
      // Gestion spécifique des erreurs
      if (err.response?.status === 409) {
        // Conflit - essayer de récupérer la liste et trouver le livreur
        try {
          const livs = await api.get("/delivery-api/livreurs");
          const clientRes = await api.get(`/client-api/clients/${clientId}`);
          const existing = livs.data.find(l => l.email === clientRes.data.email);
          
          if (existing) {
            console.log("✅ Livreur trouvé après conflit:", existing.id);
            localStorage.setItem("livreurId", existing.id.toString());
            setLivreurId(existing.id.toString());
            return;
          }
        } catch (retryErr) {
          console.error("❌ Erreur lors du retry:", retryErr);
        }
      }
      
      setError(`Erreur d'initialisation: ${err?.response?.data?.message || err.message || "Erreur inconnue"}`);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Fonction pour récupérer les livraisons
  const fetchLivraisons = useCallback(async () => {
    if (!livreurId) return;
    
    try {
      const res = await api.get(`/delivery-api/livraisons?livreurId=${livreurId}`);
      setLivraisons(res.data);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des livraisons:", err);
      setError("Impossible de charger les livraisons");
    }
  }, [livreurId]);

  // Fonction pour mettre à jour une livraison
  const updateLivraison = async (id, newStatus) => {
    try {
      const res = await api.patch(`/delivery-api/livraisons/${id}`, {
        statut: newStatus,
        livreurId,
      });
      
      if (res.status === 200) {
        setMessage(`✅ Livraison ${id} → ${newStatus}`);
        // Rafraîchir les livraisons après mise à jour
        await fetchLivraisons();
      } else {
        setMessage("❌ Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("❌ Erreur mise à jour livraison:", err);
      setMessage("❌ Erreur réseau");
    }
  };

  // Fonction pour annuler une livraison
  const cancelLivraison = (id) => updateLivraison(id, "ANNULEE");

  // Effet pour initialiser le livreur
  useEffect(() => {
    initLivreur();
  }, [initLivreur]);

  // Effet pour charger les livraisons quand le livreurId change
  useEffect(() => {
    if (livreurId) {
      fetchLivraisons();
    }
  }, [livreurId, fetchLivraisons]);

  // Effet pour effacer les messages après 3 secondes
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Affichage du loading
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="p-6 max-w-3xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initialisation en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="p-6 max-w-3xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-green-700">🚚 Mes livraisons</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!livreurId && !loading && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            ⚠️ Impossible d'initialiser le livreur. 
            <button 
              onClick={initLivreur}
              className="ml-2 underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {livreurId && (
          <>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ Livreur initialisé (ID: {livreurId})
            </div>

            {livraisons.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 mb-4">Aucune livraison pour l'instant.</p>
                <button 
                  onClick={fetchLivraisons}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Actualiser
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {livraisons.map((liv) => (
                  <div key={liv.id} className="bg-white p-4 border rounded-lg shadow-sm">
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Livraison #{liv.id}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        liv.statut === "LIVREE" ? "bg-green-100 text-green-800" :
                        liv.statut === "ANNULEE" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {liv.statut}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-4 space-y-1">
                      <div>🏠 <strong>De :</strong> {liv.adresseDepart}</div>
                      <div>🚪 <strong>À :</strong> {liv.adresseArrivee}</div>
                      <div>📞 <strong>Client :</strong> {liv.clientNom} ({liv.clientTelephone})</div>
                      {liv.commentaires && (
                        <div>💬 <strong>Commentaires :</strong> {liv.commentaires}</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {liv.statut === "EN_ATTENTE" && (
                        <button
                          onClick={() => updateLivraison(liv.id, "EN_ROUTE_RESTAURANT")}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Prendre la livraison
                        </button>
                      )}
                      {liv.statut === "EN_ROUTE_RESTAURANT" && (
                        <button
                          onClick={() => updateLivraison(liv.id, "RECUPEREE")}
                          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                        >
                          Marquer comme récupérée
                        </button>
                      )}
                      {liv.statut === "RECUPEREE" && (
                        <button
                          onClick={() => updateLivraison(liv.id, "EN_ROUTE_CLIENT")}
                          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                        >
                          Livrer au client
                        </button>
                      )}
                      {liv.statut === "EN_ROUTE_CLIENT" && (
                        <button
                          onClick={() => updateLivraison(liv.id, "LIVREE")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Marquer comme livrée
                        </button>
                      )}
                      {liv.statut !== "LIVREE" && liv.statut !== "ANNULEE" && (
                        <button
                          onClick={() => cancelLivraison(liv.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Message de notification */}
        {message && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg transition-all duration-500 ${
              message.startsWith("✅") ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
            style={{ zIndex: 1000 }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
