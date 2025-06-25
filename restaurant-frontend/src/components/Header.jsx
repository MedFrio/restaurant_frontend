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

  const goToAccount = () => {
    navigate("/mon-compte");
  };

  const goToHome = () => {
    navigate("/accueil");
  };

  const goToRolePage = () => {
    navigate(`/${role}`);
  };

  return (
    <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
      {/* Rôle cliquable */}
      <span
        onClick={goToRolePage}
        className="text-gray-700 font-semibold capitalize cursor-pointer hover:underline"
        title="Aller à votre tableau de bord"
      >
        {role}
      </span>

      <div className="space-x-2">
        <button
          onClick={goToHome}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Accueil
        </button>

        <button
          onClick={goToAccount}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Mon compte
        </button>

        <button
          onClick={handleLogout}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
