import React from "react";
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

  // Fonction pour attendre un délai (non utilisée dans le rendu final, mais utile pour le débogage)
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
        motDePasse: `pwd_${Date.now()}`,
        vehicule: "Scooter",
        numeroLicence: `LIC_${Date.now()}`,
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

      if (err.response?.status === 409) {
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

  // Fonction pour tronquer le texte long
  const truncateText = useCallback((text, maxLength = 30) => {
    if (typeof text !== 'string') return ''; // S'assurer que 'text' est une chaîne
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }, []); // [] car la fonction ne dépend d'aucune variable d'état/props

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

  // Fonction pour obtenir l'icône et couleur selon le statut
  const getStatusDisplay = useCallback((statut) => {
    const statusMap = {
      "EN_ATTENTE": { icon: "⏳", color: "orange", bg: "from-orange-400 to-orange-600", text: "En attente" },
      "EN_ROUTE_RESTAURANT": { icon: "🚗", color: "blue", bg: "from-blue-400 to-blue-600", text: "En route restaurant" },
      "RECUPEREE": { icon: "📦", color: "purple", bg: "from-purple-400 to-purple-600", text: "Récupérée" },
      "EN_ROUTE_CLIENT": { icon: "🛵", color: "indigo", bg: "from-indigo-400 to-indigo-600", text: "En route client" },
      "LIVREE": { icon: "✅", color: "green", bg: "from-green-400 to-green-600", text: "Livrée" },
      "ANNULEE": { icon: "❌", color: "red", bg: "from-red-400 to-red-600", text: "Annulée" }
    };
    return statusMap[statut] || statusMap["EN_ATTENTE"];
  }, []); // [] car la fonction ne dépend d'aucune variable d'état/props

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-8"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-pink-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Initialisation en cours...</h3>
            <p className="text-purple-200">Préparation de votre espace livreur</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">🚚</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Mes Livraisons
            </h1>
            <p className="text-lg md:text-xl text-purple-200 max-w-2xl mx-auto">
              Gérez vos livraisons avec style et efficacité
            </p>
          </div>

          {/* Status Cards */}
          {error && (
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-xl">⚠️</span>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-red-300 font-semibold text-lg">Erreur</h3>
                    <p className="text-red-200 break-words">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!livreurId && !loading && (
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white text-xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-yellow-300 font-semibold text-lg">Initialisation requise</h3>
                      <p className="text-yellow-200">Impossible d'initialiser le livreur</p>
                    </div>
                  </div>
                  <button
                    onClick={initLivreur}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex-shrink-0"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {livreurId && (
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-xl">✅</span>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-green-300 font-semibold text-lg">Livreur connecté</h3>
                    <p className="text-green-200 font-mono text-sm break-all">ID: {livreurId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Livraisons Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {livreurId && (
          <>
            {livraisons.length === 0 ? (
              <div className="text-center">
                <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/30 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-12 max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📦</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Aucune livraison</h3>
                  <p className="text-purple-200 mb-8 text-lg">Aucune livraison disponible pour l'instant</p>
                  <button
                    onClick={fetchLivraisons}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  >
                    🔄 Actualiser
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {livraisons.map((liv) => {
                  const statusDisplay = getStatusDisplay(liv.statut);
                  return (
                    <div key={liv.id} className="group">
                      <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/30 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-purple-400/40 h-full flex flex-col">
                        {/* Header - Fixed height */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center min-w-0 flex-1">
                              {/* C'est ici que les changements sont appliqués */}
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden px-1">
                                <span className="text-white font-bold text-xs leading-none text-center break-all">
                                  {truncateText(liv.id, 9)}
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-lg truncate">Livraison #{truncateText(liv.id, 15)}</h3>
                            </div>
                          </div>
                          <div className={`bg-gradient-to-r ${statusDisplay.bg} px-3 py-2 rounded-full inline-block`}>
                            <span className="text-white font-semibold text-sm flex items-center">
                              <span className="mr-2">{statusDisplay.icon}</span>
                              <span className="truncate">{statusDisplay.text}</span>
                            </span>
                          </div>
                        </div>

                        {/* Details - Flexible height */}
                        <div className="space-y-4 mb-6 flex-1">
                          <div className="flex items-start">
                            <span className="text-xl mr-3 flex-shrink-0 mt-1">🏪</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-purple-200 text-sm font-medium mb-1">Départ</p>
                              <p className="text-white text-sm break-words">{truncateText(liv.adresseDepart, 40)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-center py-2">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                            <span className="text-purple-400 mx-4 text-2xl">↓</span>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                          </div>

                          <div className="flex items-start">
                            <span className="text-xl mr-3 flex-shrink-0 mt-1">🏠</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-purple-200 text-sm font-medium mb-1">Arrivée</p>
                              <p className="text-white text-sm break-words">{truncateText(liv.adresseArrivee, 40)}</p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <span className="text-xl mr-3 flex-shrink-0 mt-1">👤</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-purple-200 text-sm font-medium mb-1">Client</p>
                              <p className="text-white text-sm font-medium break-words">{truncateText(liv.clientNom, 25)}</p>
                              <p className="text-purple-300 text-sm font-mono">{liv.clientTelephone}</p>
                            </div>
                          </div>

                          {liv.commentaires && (
                            <div className="flex items-start">
                              <span className="text-xl mr-3 flex-shrink-0 mt-1">💬</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-purple-200 text-sm font-medium mb-1">Commentaires</p>
                                <p className="text-white text-sm break-words">{truncateText(liv.commentaires, 50)}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions - Fixed at bottom */}
                        <div className="space-y-3 mt-auto">
                          {liv.statut === "EN_ATTENTE" && (
                            <button
                              onClick={() => updateLivraison(liv.id, "EN_ROUTE_RESTAURANT")}
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-sm"
                            >
                              🚗 Prendre la livraison
                            </button>
                          )}
                          {liv.statut === "EN_ROUTE_RESTAURANT" && (
                            <button
                              onClick={() => updateLivraison(liv.id, "RECUPEREE")}
                              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-sm"
                            >
                              📦 Marquer comme récupérée
                            </button>
                          )}
                          {liv.statut === "RECUPEREE" && (
                            <button
                              onClick={() => updateLivraison(liv.id, "EN_ROUTE_CLIENT")}
                              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-sm"
                            >
                              🛵 Livrer au client
                            </button>
                          )}
                          {liv.statut === "EN_ROUTE_CLIENT" && (
                            <button
                              onClick={() => updateLivraison(liv.id, "LIVREE")}
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-sm"
                            >
                              ✅ Marquer comme livrée
                            </button>
                          )}
                          {liv.statut !== "LIVREE" && liv.statut !== "ANNULEE" && (
                            <button
                              onClick={() => cancelLivraison(liv.id)}
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg border-2 border-red-400/30 text-sm"
                            >
                              ❌ Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Message de notification */}
      {message && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border transition-all duration-500 transform max-w-sm ${
            message.startsWith("✅")
              ? "bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-400/50 text-white"
              : "bg-gradient-to-r from-red-500/90 to-pink-500/90 border-red-400/50 text-white"
          }`}>
            <p className="font-semibold text-sm break-words">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
