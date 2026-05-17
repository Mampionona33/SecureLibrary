import api from "./api";

export const login = async (email: string, password: string) => {
  const res = await api.post("/users/login/", { email, password });
  return res.data;
};

// 🔹 Register (inscription)
export const register = async (userData: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) => {
  const res = await api.post("/users/register/", userData);
  return res.data;
};

// 🔹 Logout (optionnel, si tu crées un endpoint côté backend)
export const logout = async () => {
  const res = await api.post("/users/logout/");
  return res.data;
};
