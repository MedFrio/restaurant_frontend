import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  if (!role) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
      <span className="text-gray-700 font-semibold capitalize">{role}</span>
      <button
        onClick={handleLogout}
        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Déconnexion
      </button>
    </div>
  );
}
