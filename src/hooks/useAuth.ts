import { useEffect, useState } from "react";

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantCity?: string;
  restaurantPostalCode?: string;
  supplierName?: string;
  supplierAddress?: string;
  supplierCity?: string;
  supplierPostalCode?: string;
  supplierDescription?: string;
  status: "active" | "inactive" | "pending";
  createdAt: number;
  updatedAt: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка пользователя из localStorage при монтировании
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      // Здесь можно добавить проверку токена на сервере
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };
}
