import { useState } from "react";
import { api } from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/client-api/login", form);
      const { access_token, client } = res.data;

      if (access_token && client?.role && client?.id) {
        login(
          client.role.toLowerCase(),
          access_token,
          client.id,
          client.firstName
        );
        navigate(`/${client.role.toLowerCase()}`);
      } else {
        setError("Réponse invalide du serveur");
      }
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded w-80"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900">Connexion</h2>

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Mot de passe"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Se connecter
        </button>

        <p className="mt-4 text-sm text-center text-gray-700">
          Vous n’avez pas de compte ?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Créez-en un
          </Link>
        </p>
      </form>
    </div>
  );
}
