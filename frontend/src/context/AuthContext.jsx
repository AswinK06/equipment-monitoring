import { createContext, useCallback, useEffect, useState } from "react";
import { login as apiLogin } from "../api/authApi";
import { setUnauthorizedHandler } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem("auth_token") || null;
  });

  const [authError, setAuthError] = useState("");

  const logout = useCallback((reason = "") => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_expires");
    if (reason) setAuthError(reason);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler((msg) => {
      logout(msg);
    });
  }, [logout]);

  // Check token expiration periodically
  useEffect(() => {
    const expiresAt = sessionStorage.getItem("auth_expires");
    if (!expiresAt || !token) return;

    const remainingMs = new Date(expiresAt).getTime() - Date.now();
    if (remainingMs <= 0) {
      logout("Your session expired. Please sign in again.");
      return;
    }

    const timer = setTimeout(() => {
      logout("Your session expired. Please sign in again.");
    }, remainingMs);

    return () => clearTimeout(timer);
  }, [token, logout]);

  const login = useCallback(async (email, password) => {
    setAuthError("");
    const res = await apiLogin(email, password);
    const userData = {
      email: res.email,
      displayName: res.displayName,
      role: res.role,
    };
    setUser(userData);
    setToken(res.accessToken);
    sessionStorage.setItem("auth_user", JSON.stringify(userData));
    sessionStorage.setItem("auth_token", res.accessToken);
    sessionStorage.setItem("auth_expires", res.expiresAt);
    return res;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, authError, setAuthError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
