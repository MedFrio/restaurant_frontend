import { useState } from "react";
import { api } from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
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
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true); // Start loading

    try {
      const res = await api.post("/client-api/clients", form);
      if (res.status === 201 || res.data?.id) {
        setSuccess("Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.");
        setTimeout(() => navigate("/"), 2000); // Give user time to read success message
      } else {
        setError("Erreur lors de la création du compte. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Sign-up error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Erreur : ${err.response.data.message}`);
      } else {
        setError("Erreur : L'email existe déjà ou les données sont invalides.");
      }
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg transform transition-transform duration-300 ease-in-out hover:scale-[1.01]">
        <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 flex items-center justify-center">
          <span className="mr-3 text-5xl">📝</span> Créez votre compte
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold mr-2">Erreur !</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold mr-2">Succès !</strong>
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 text-sm font-semibold mb-2">
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 text-sm font-semibold mb-2">
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Votre nom"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
              Adresse Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="exemple@votredomaine.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 caractères"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">
              Téléphone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel" // Use type="tel" for better mobile keyboard experience
              value={form.phone}
              onChange={handleChange}
              placeholder="Ex: 06 12 34 56 78"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700 text-sm font-semibold mb-2">
              Adresse
            </label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Numéro et nom de rue"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">
                Ville
              </label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Votre ville"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-gray-700 text-sm font-semibold mb-2">
                Code Postal
              </label>
              <input
                id="postalCode"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Ex: 75000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-lg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-gray-700 text-sm font-semibold mb-2">
              Je suis un(e)...
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg cursor-pointer"
              >
                <option value="CLIENT">Client</option>
                <option value="CHEF">Chef</option>
                <option value="LIVREUR">Livreur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </>
            ) : (
              <>
                <span className="mr-2 text-xl">🚀</span> S'inscrire
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-md text-center text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link to="/" className="text-indigo-600 font-semibold hover:underline transition duration-200">
            Connectez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}
