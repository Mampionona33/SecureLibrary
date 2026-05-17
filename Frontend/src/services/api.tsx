import axios from "axios";
import Constants from "expo-constants";

const baseURL = Constants.expoConfig?.extra?.backendUrl; // ✅ pas "apiUrl"
console.log("API URL utilisée :", baseURL);

const api = axios.create({
  baseURL,
  timeout: 5000,
});

export default api;
