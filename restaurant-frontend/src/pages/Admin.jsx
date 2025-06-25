import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import Header from "../components/Header";

export default function Admin() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      const res = await api.get("/client-api/clients");
      setClients(res.data);
    } catch (err) {
      setError("Impossible de charger les utilisateurs.");
    }
  };

  const supprimerClient = async (id) => {
    try {
      await api.delete(`/client-api/clients/${id}`);
      setClients(clients.filter(c => c.id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">👤 Gestion des utilisateurs</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Téléphone</th>
                <th className="p-2 border">Rôle</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((user) => (
                <tr key={user.id} className="text-sm text-gray-800">
                  <td className="p-2 border">{user.firstName} {user.lastName}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.phone}</td>
                  <td className="p-2 border capitalize">{user.role}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => supprimerClient(user.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
