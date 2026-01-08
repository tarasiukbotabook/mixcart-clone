"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import SupplierSidebar from "@/components/SupplierSidebar";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  type: "restaurant" | "supplier";
  status: "active" | "inactive" | "pending";
  createdAt: number;
  updatedAt: number;
}

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Получение текущего пользователя
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) {
      router.push("/auth/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (currentUser !== undefined) {
      if (!currentUser) {
        localStorage.removeItem("auth_token");
        router.push("/auth/login");
      } else {
        const userData = currentUser as User;
        // Проверяем, что это поставщик
        if (userData.type !== "supplier") {
          router.push("/");
        } else {
          setUser(userData);
        }
      }
      setLoading(false);
    }
  }, [currentUser, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupplierSidebar userEmail={user.email} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
