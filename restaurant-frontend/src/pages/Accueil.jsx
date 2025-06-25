import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Accueil() {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-gray-100 rounded-xl shadow-md p-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center">
          🍽️ Projet Microservices - Restaurant
        </h1>

        <p className="text-lg mb-6 text-gray-700 text-justify">
          Cette application fullstack est basée sur une architecture <strong>microservices</strong> avec une <strong>API Gateway</strong> qui centralise tous les échanges entre le frontend et les services métiers.
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">🔗 Services disponibles :</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>🧑‍💼 <strong>Gestion Client</strong> : création de compte, login, profil</li>
            <li>📋 <strong>Commandes</strong> : menu, panier, envoi de commandes</li>
            <li>👨‍🍳 <strong>Cuisine</strong> : suivi des commandes à préparer</li>
            <li>🛵 <strong>Livreur</strong> : livraison des commandes client</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">🧭 Navigation :</h2>
          <ul className="list-disc pl-6 space-y-1 text-blue-700 font-medium">
            <li><Link to="/">/</Link> – Connexion</li>
            <li><Link to="/signup">/signup</Link> – Inscription client</li>
            <li><Link to="/client">/client</Link> – Interface client (commande)</li>
            <li><Link to="/mes-commandes">/mes-commandes</Link> – Historique des commandes</li>
            <li><Link to="/chef">/chef</Link> – Interface chef (préparation)</li>
            <li><Link to="/livreur">/livreur</Link> – Interface livreur (livraison)</li>
            <li><Link to="/admin">/admin</Link> – Interface admin (gestion)</li>
          </ul>
        </section>

        {role && (
          <div className="mt-8 p-4 bg-green-100 border border-green-400 rounded text-green-800 text-center font-medium">
            ✅ Vous êtes connecté en tant que : <strong>{role}</strong><br />
            Accès direct : <Link to={`/${role}`} className="underline text-green-700">/{role}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
