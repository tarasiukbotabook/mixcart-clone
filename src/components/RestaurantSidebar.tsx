"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HomeIcon, OrdersIcon, CatalogIcon, AnalyticsIcon, LogoutIcon, ProfileIcon, CartIcon } from "./Icons";

interface RestaurantSidebarProps {
  userEmail: string;
}

export default function RestaurantSidebar({ userEmail }: RestaurantSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useMutation(api.auth.logout);

  const menuItems = [
    {
      label: "Главное",
      href: "/restaurant/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Заказы",
      href: "/restaurant/orders",
      icon: OrdersIcon,
    },
    {
      label: "Каталог",
      href: "/restaurant/catalog",
      icon: CatalogIcon,
    },
    {
      label: "Корзина",
      href: "/restaurant/cart",
      icon: CartIcon,
    },
    {
      label: "Аналитика",
      href: "/restaurant/analytics",
      icon: AnalyticsIcon,
    },
    {
      label: "Профиль",
      href: "/restaurant/profile",
      icon: ProfileIcon,
    },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await logout({ token });
        localStorage.removeItem("auth_token");
        document.cookie = "auth_token=; path=/; max-age=0";
        toast.success("Вы вышли из аккаунта");
        router.push("/");
      } catch (error) {
        toast.error("Ошибка при выходе");
      }
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold text-blue-400">
          HubFood
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => router.push("/restaurant/profile")}
          className="w-full mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition cursor-pointer"
        >
          <p className="text-xs text-gray-400 text-left">Аккаунт</p>
          <p className="text-sm font-medium truncate text-left text-blue-400 hover:text-blue-300">
            {userEmail}
          </p>
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium flex items-center justify-center gap-2"
        >
          <LogoutIcon />
          Выход
        </button>
      </div>
    </aside>
  );
}
