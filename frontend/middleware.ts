import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const minioOrigin = (process.env.MINIO_INTERNAL_URL ?? "http://localhost:9000").replace(
  /\/$/,
  "",
);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/marka/")) {
    return NextResponse.next();
  }

  const target = new URL(`${pathname}${request.nextUrl.search}`, `${minioOrigin}/`);
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: "/marka/:path*",
};
