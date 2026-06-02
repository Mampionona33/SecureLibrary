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
    try {
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
    } catch (error) {
      console.error("❌ Request interceptor error:", error);
      return Promise.reject(error);
    }
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
    const url = error.config?.url;

    console.log("❌ API ERROR");
    console.log("URL:", url);
    console.log("STATUS:", status);
    console.log("MESSAGE:", error.message);
    console.log("DATA:", error.response?.data);

    // JWT expiré ou invalide
    if (status === 401) {
      console.log("🔒 Session expirée");

      await AsyncStorage.removeItem("accessToken");

      /**
       * Ici tu peux :
       * - rediriger vers Login
       * - vider le store utilisateur
       * - afficher une notification
       */

      // Exemple:
      // router.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default api;
