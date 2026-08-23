import axios from "axios";

const normalizeApiBaseUrl = (url) => {
  const trimmed = String(url || "").trim().replace(/\/$/, "");
  if (!trimmed) {
    return "https://studyshare-backend-1-vopy.onrender.com/api";
  }
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const API_URL = normalizeApiBaseUrl(
  process.env.REACT_APP_API_URL || "https://studyshare-backend-1-vopy.onrender.com"
);

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("fullName");

      if (window.location.pathname !== "/login") {
        // Preserve where the user was (e.g. a Study Circle invitation
        // link) so they land back there after signing back in, instead
        // of losing that context on a session expiry.
        const returnTo = `${window.location.pathname}${window.location.search}`;
        const redirectParam = returnTo && returnTo !== "/" ? `?redirect=${encodeURIComponent(returnTo)}` : "";
        window.location.href = `/login${redirectParam}`;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
