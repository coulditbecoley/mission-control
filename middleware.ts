import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Remove CSP header for development to allow eval in dependencies
  response.headers.delete('content-security-policy');
  
  return response;
}

export const config = {
  matcher: ['/:path*'],
};
