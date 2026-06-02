import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL =
  Constants.expoConfig?.extra?.backendUrl || "http://192.168.201.29:8000/api";

const api = axios.create({
  baseURL,
  timeout: 30000, // ⚠️ important pour upload fichiers
});

// 🔐 JWT interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ❌ IMPORTANT: ne jamais override Content-Type pour FormData
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"];
  }

  return config;
});

// 🔍 logs utiles
api.interceptors.response.use(
  (response) => {
    console.log("✅ API:", response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ API ERROR:");
    console.log("URL:", error.config?.url);
    console.log("MSG:", error.message);
    console.log("DATA:", error.response?.data);

    return Promise.reject(error);
  },
);

export default api;
