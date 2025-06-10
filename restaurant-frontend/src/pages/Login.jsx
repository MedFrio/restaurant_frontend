import { useState } from "react";
import { api } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Reset erreur à chaque saisie
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.username || !form.password) {
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", form);
      if (res.data.token) {
        login(res.data.role, res.data.token);
        navigate(`/${res.data.role}`);
      } else {
        setError("Identifiants invalides");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Nom d'utilisateur ou mot de passe incorrect");
      } else {
        setError("Erreur de connexion au serveur. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.username.trim() !== "" && form.password.trim() !== "";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-600 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        noValidate
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Connexion
        </h2>

        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Nom d'utilisateur"
          className="w-full mb-5 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          autoComplete="username"
          required
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Mot de passe"
          className="w-full mb-5 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-red-600 mb-4 text-center font-medium animate-pulse">
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-3 rounded-md text-white font-semibold transition
            ${
              !isFormValid || loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }
          `}
        >
          {loading ? (
            <svg
              className="mx-auto h-6 w-6 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </div>
  );
}
