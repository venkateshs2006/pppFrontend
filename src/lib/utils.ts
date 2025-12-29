import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export interface DecodedToken {
  sub: string;       // Usually email or username
  exp: number;       // Expiration time
  iat: number;       // Issued at
  userId?: number;   // Custom field (verify with your backend)
  id?: number;       // Alternative custom field
  role?: string;
  [key: string]: any;
}

export function parseJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid Token", error);
    return null;
  }
}