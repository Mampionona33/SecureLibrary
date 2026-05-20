import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL =
  Constants.expoConfig?.extra?.backendUrl || "http://192.168.201.29:8000/api";

const api = axios.create({
  baseURL,
  timeout: 5000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour logger les réponses
api.interceptors.response.use(
  (response) => {
    console.log("✅ Réponse API réussie :", response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error(
      "❌ Erreur API :",
      error.config.url,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default api;
