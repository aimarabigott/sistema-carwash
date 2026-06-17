import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteger la ruta del Super Admin aislada
  if (pathname.startsWith('/system-core') && pathname !== '/system-core/login') {
    const token = req.cookies.get('carwash_god_mode');
    if (token?.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/system-core/login', req.url));
    }
  }

  // Dejar que NextAuth proteja el resto (/app, etc) según su configuración
  return (auth as any)(req);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
