import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL =
  Constants.expoConfig?.extra?.backendUrl || "http://192.168.201.29:8000/api";

const api = axios.create({
  baseURL,
  timeout: 30000,
});
console.log("🌍 API URL =", baseURL);

// ==========================
// Request Interceptor
// ==========================
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ne pas forcer Content-Type sur FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ==========================
// Response Interceptor
// ==========================
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
    );
    return response;
  },
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.log("🔒 Token expiré, tentative de refresh...");

      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          await AsyncStorage.setItem("accessToken", newAccessToken);

          // Réessayer la requête originale avec le nouveau token
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          console.log("❌ Refresh échoué, déconnexion...");
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          // router.replace("/login");
        }
      } else {
        console.log("❌ Pas de refreshToken disponible");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
