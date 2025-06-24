import { useState } from "react";
import { api } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

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
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/client-api/clients", form);
      if (res.status === 201 || res.data?.id) {
        setSuccess("Compte créé avec succès ! Redirection...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError("Erreur lors de la création du compte.");
      }
    } catch (err) {
      setError("Erreur : l’email existe déjà ou données invalides.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900">Créer un compte</h2>

        <div className="grid grid-cols-2 gap-4">
          <input name="firstName" placeholder="Prénom" onChange={handleChange} className="p-2 border rounded" />
          <input name="lastName" placeholder="Nom" onChange={handleChange} className="p-2 border rounded" />
        </div>

        <input name="email" placeholder="Email" type="email" onChange={handleChange} className="w-full mt-4 p-2 border rounded" />
        <input name="password" placeholder="Mot de passe" type="password" onChange={handleChange} className="w-full mt-2 p-2 border rounded" />

        <input name="phone" placeholder="Téléphone" onChange={handleChange} className="w-full mt-2 p-2 border rounded" />
        <input name="address" placeholder="Adresse" onChange={handleChange} className="w-full mt-2 p-2 border rounded" />
        <input name="city" placeholder="Ville" onChange={handleChange} className="w-full mt-2 p-2 border rounded" />
        <input name="postalCode" placeholder="Code postal" onChange={handleChange} className="w-full mt-2 p-2 border rounded" />

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        {success && <p className="text-green-600 mt-2 text-sm">{success}</p>}

        <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          S’inscrire
        </button>
      </form>
    </div>
  );
}
