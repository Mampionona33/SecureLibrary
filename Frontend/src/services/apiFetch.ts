import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const baseURL =
  Constants.expoConfig?.extra?.backendUrl || "http://192.168.201.29:8000/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem("accessToken");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ne pas forcer Content-Type si FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(`${baseURL}${path}`, { ...options, headers });

  // Gestion du refresh si 401
  if (response.status === 401) {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (refreshToken) {
      const refreshRes = await fetch(`${baseURL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const { access } = await refreshRes.json();
        await AsyncStorage.setItem("accessToken", access);

        headers["Authorization"] = `Bearer ${access}`;
        response = await fetch(`${baseURL}${path}`, { ...options, headers });
      } else {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        throw new Error("Session expirée, reconnectez-vous.");
      }
    }
  }

  return response;
}
