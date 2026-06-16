import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const publicRoutes = ["/", "/login", "/login/verify"];
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && req.auth?.user) {
    const consentRequired = pathname !== "/consent" && !pathname.startsWith("/api");
    // Si no tiene consent, redirigir (se implementa en Paso 5)
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|sw.js|workbox).*)"],
};
