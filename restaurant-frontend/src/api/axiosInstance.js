import axios from "axios";

// Crée une instance Axios avec l'URL de base de la Gateway
export const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Fonction utilitaire pour injecter le token JWT
export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
