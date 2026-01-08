import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Маршруты, требующие авторизации
const protectedRoutes = ["/dashboard", "/supplier", "/orders"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Проверяем, требует ли маршрут авторизацию
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    // Перенаправляем на страницу входа
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
