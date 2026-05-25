import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { formatLogTimestamp } from "@/lib/logger";

/**
 * В dev в терминале Next по умолчанию печатается строка без даты (`GET /path 200 in …ms`).
 * Добавляем свою строку с датой/временем; встроенный формат Next отключить нельзя.
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    console.log(`[${formatLogTimestamp()}] ${request.method} ${path}`);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:webm|mp4|png|jpg|jpeg|gif|webp|svg|ico|woff2?)).*)",
  ],
};
