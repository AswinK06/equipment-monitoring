import { api } from "./client";

export async function login(email, password) {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(payload) {
  return api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe() {
  return api("/api/auth/me");
}

export async function logout() {
  return api("/api/auth/logout", {
    method: "POST",
  });
}
