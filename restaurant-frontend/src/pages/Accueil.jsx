import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

export default function Accueil() {
  const { role } = useAuth();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
      <Header />
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h1 className="text-5xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
            Bienvenue chez <span className="text-indigo-600">RestoMicro</span> 🍽️
          </h1>

          <p className="text-xl mb-10 text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
            Découvrez notre plateforme fullstack basée sur une architecture robuste de{" "}
            <strong className="text-blue-600">microservices</strong>, orchestrée par une{" "}
            <strong className="text-indigo-600">API Gateway</strong> pour une expérience fluide et intégrée.
          </p>

          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <section className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold text-blue-700 mb-4 flex items-center">
                <span className="mr-3 text-4xl">✨</span> Services Clés
              </h2>
              <ul className="space-y-3 text-lg text-gray-800">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">👤</span>{" "}
                  <strong>Gestion Client</strong> : Créez votre compte, connectez-vous, gérez votre profil.
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🛒</span>{" "}
                  <strong>Commandes Simplifiées</strong> : Parcourez le menu, ajoutez au panier, envoyez vos commandes.
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">👨‍🍳</span>{" "}
                  <strong>Interface Cuisine</strong> : Suivez et préparez les commandes en temps réel.
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🛵</span>{" "}
                  <strong>Livraison Rapide</strong> : Pour des commandes livrées à temps chez le client.
                </li>
              </ul>
            </section>

            <section className="bg-indigo-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold text-indigo-700 mb-4 flex items-center">
                <span className="mr-3 text-4xl">🚀</span> Accès Rapide
              </h2>
              <nav>
                <ul className="space-y-3 text-lg">
                  <li>
                    <Link
                      to="/"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <span className="mr-2">➡️</span> Connexion <span className="text-sm text-gray-500 ml-2">(/)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <span className="mr-2">➡️</span> Inscription Client <span className="text-sm text-gray-500 ml-2">(/signup)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/client"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <span className="mr-2">➡️</span> Espace Client <span className="text-sm text-gray-500 ml-2">(/client)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/mes-commandes"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <span className="mr-2">➡️</span> Mes Commandes <span className="text-sm text-gray-500 ml-2">(/mes-commandes)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chef"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <span className="mr-2">➡️</span> Espace Chef <span className="text-sm text-gray-500 ml-2">(/chef)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/livreur"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <span className="mr-2">➡️</span> Espace Livreur <span className="text-sm text-gray-500 ml-2">(/livreur)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                    >
                      <span className="mr-2">➡️</span> Espace Admin <span className="text-sm text-gray-500 ml-2">(/admin)</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </section>
          </div>

          {role && (
            <div className="mt-10 p-6 bg-green-100 border-l-4 border-green-500 text-green-900 rounded-lg shadow-md text-center text-xl font-medium">
              <p className="mb-2">🎉 Vous êtes connecté en tant que : <strong className="text-green-700 capitalize">{role}</strong></p>
              <p>
                Accédez directement à votre tableau de bord :{" "}
                <Link to={`/${role}`} className="underline text-green-700 hover:text-green-900 font-bold transition-colors duration-200">
                  Aller à l'espace {role}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
