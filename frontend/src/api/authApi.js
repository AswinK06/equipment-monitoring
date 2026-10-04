import { api } from "./client";

export async function login(email, password) {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return api("/api/auth/me");
}
