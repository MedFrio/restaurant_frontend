import { createContext, useState, useContext } from "react";
import { setAuthHeader } from "../api/axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [clientId, setClientId] = useState(() => localStorage.getItem("clientId"));
  const [firstName, setFirstName] = useState(() => localStorage.getItem("firstName"));

  // Si un token est présent au chargement → le réinjecter dans Axios
  if (token) {
    setAuthHeader(token);
  }

  const login = (userRole, userToken, userId, userFirstName) => {
    setRole(userRole);
    setToken(userToken);
    setClientId(userId);
    setFirstName(userFirstName);

    localStorage.setItem("role", userRole);
    localStorage.setItem("token", userToken);
    localStorage.setItem("clientId", userId);
    localStorage.setItem("firstName", userFirstName);

    setAuthHeader(userToken);
  };

  const logout = () => {
    setRole(null);
    setToken(null);
    setClientId(null);
    setFirstName(null);

    localStorage.clear();
    setAuthHeader(null);
  };

  return (
    <AuthContext.Provider
      value={{ role, token, clientId, firstName, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
