import { useState } from "react";

export default function SignUp() {
  // const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    role: "CLIENT"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // const res = await api.post("/client-api/clients", form);
      // Simulation for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess("Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.");
      // setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Sign-up error:", err);
      setError("Erreur : L'email existe déjà ou les données sont invalides.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleEmoji = (role) => {
    switch (role) {
      case "CLIENT": return "👤";
      case "CHEF": return "👨‍🍳";
      case "LIVREUR": return "🚚";
      case "ADMIN": return "👑";
      default: return "👤";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-violet-300 to-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Créez votre compte
            </h1>
            <p className="text-gray-600 text-lg">
              Rejoignez notre communauté et commencez dès maintenant
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-500 text-xl">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-500 text-xl">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">👤</span>
                  Prénom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">👤</span>
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 flex items-center">
                <span className="mr-2">📧</span>
                Adresse Email
              </label>
              <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="exemple@votredomaine.com"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
                  required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 flex items-center">
                <span className="mr-2">🔒</span>
                Mot de passe
              </label>
              <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
                  required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 flex items-center">
                <span className="mr-2">📱</span>
                Téléphone
              </label>
              <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Ex: 06 12 34 56 78"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 flex items-center">
                <span className="mr-2">🏠</span>
                Adresse
              </label>
              <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Numéro et nom de rue"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
              />
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">🏙️</span>
                  Ville
                </label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Votre ville"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-700 flex items-center">
                  <span className="mr-2">📮</span>
                  Code Postal
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Ex: 75000"
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 flex items-center">
                <span className="mr-2">🎭</span>
                Je suis un(e)...
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  // Added !bg-white and !text-gray-900 for stronger override
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 !bg-white !text-gray-900 appearance-none cursor-pointer"
                >
                  {/* Options also get !text-gray-900 for explicit color */}
                  <option value="CLIENT" className="!text-gray-900">👤 Client</option>
                  <option value="CHEF" className="!text-gray-900">👨‍🍳 Chef</option>
                  <option value="LIVREUR" className="!text-gray-900">🚚 Livreur</option>
                  <option value="ADMIN" className="!text-gray-900">👑 Administrateur</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Inscription en cours...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2 text-xl">✨</span>
                  <span>Créer mon compte</span>
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="px-4 text-sm text-gray-500">ou</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <p className="text-gray-600">
              Vous avez déjà un compte ?{" "}
              <a 
                href="#" 
                className="text-violet-600 font-semibold hover:text-violet-700 transition-colors duration-300 hover:underline"
              >
                Connectez-vous ici
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
