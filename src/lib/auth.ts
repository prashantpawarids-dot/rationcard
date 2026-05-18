const KEY = "idsid_ration_auth";

export type Role = "Admin" | "Distributor" | "Inspector";

export interface AuthSession {
  email: string;
  role: Role;
  name: string;
}

export const ADMIN_CREDS = { email: "admin@gov.in", password: "Admin@123" };

export function login(email: string, password: string, role: Role): AuthSession | null {
  if (email.trim().toLowerCase() === ADMIN_CREDS.email && password === ADMIN_CREDS.password) {
    const session: AuthSession = { email, role, name: role === "Admin" ? "Govt. Administrator" : role };
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }
  return null;
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
