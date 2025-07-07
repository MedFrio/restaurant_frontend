import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useState, useEffect } from "react";

export default function Accueil() {
  const { role } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const services = [
    {
      icon: "👤",
      title: "Gestion Client",
      description: "Créez votre compte, connectez-vous, gérez votre profil.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "🛒",
      title: "Commandes Simplifiées",
      description: "Parcourez le menu, ajoutez au panier, envoyez vos commandes.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "👨‍🍳",
      title: "Interface Cuisine",
      description: "Suivez et préparez les commandes en temps réel.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: "🛵",
      title: "Livraison Rapide",
      description: "Pour des commandes livrées à temps chez le client.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const quickAccess = [
    { to: "/", label: "Connexion", icon: "🔐", color: "hover:from-violet-600 hover:to-purple-600" },
    { to: "/signup", label: "Inscription", icon: "📝", color: "hover:from-blue-600 hover:to-indigo-600" },
    { to: "/client", label: "Espace Client", icon: "👤", color: "hover:from-green-600 hover:to-emerald-600" },
    { to: "/mes-commandes", label: "Mes Commandes", icon: "📋", color: "hover:from-yellow-600 hover:to-orange-600" },
    { to: "/chef", label: "Espace Chef", icon: "👨‍🍳", color: "hover:from-red-600 hover:to-pink-600" },
    { to: "/livreur", label: "Espace Livreur", icon: "🛵", color: "hover:from-cyan-600 hover:to-blue-600" },
    { to: "/admin", label: "Admin", icon: "⚙️", color: "hover:from-purple-600 hover:to-violet-600" }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)`
        }}
      />
      
      {/* Floating Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Header />
      
      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-7xl md:text-8xl font-black mb-8 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-pulse">
            Micro<span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Resto</span>
          </h1>
          <div className="text-4xl mb-6 animate-bounce">🍽️✨</div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Découvrez notre plateforme fullstack basée sur une architecture robuste de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">microservices</span>,
            orchestrée par une{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold">API Gateway</span>
            {" "}pour une expérience fluide et intégrée.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:rotate-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div className={`bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            🚀 Accès Rapide
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccess.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className={`group relative bg-gradient-to-r from-white/10 to-white/5 ${item.color} backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 block text-center`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <span className="text-white font-semibold text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all duration-300">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* User Status */}
        {role && (
          <div className={`relative bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-xl rounded-3xl p-8 border border-green-400/30 text-center overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse" />
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <p className="text-2xl mb-4 text-green-100">
                Vous êtes connecté en tant que : <strong className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 capitalize">{role}</strong>
              </p>
              <Link 
                to={`/${role}`} 
                className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50"
              >
                ✨ Accéder à l'espace {role}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/50 to-transparent" />
    </div>
  );
}
