import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Injecter le token JWT automatiquement dans chaque requête
api.interceptors.request.use((config) => {
  const persistedAuth = localStorage.getItem("persist:agent-crm");
  const token = persistedAuth
    ? JSON.parse(JSON.parse(persistedAuth).auth).token
    : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gérer les erreurs 401 — token expiré
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
