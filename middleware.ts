import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/assignments", request.url))
  }
  return NextResponse.next()
}

// Add this config to specify which routes the middleware applies to
export const config = {
  matcher: ["/"],
}
