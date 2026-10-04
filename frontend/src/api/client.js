export const API =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:5000";

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorizedCallback = handler;
}

/** Fetch JSON from the backend; throws Error with a readable message (RFC 7807 detail / validation errors). */
export async function api(path, opts = {}) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("auth_token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  let res;
  try {
    res = await fetch(API + path, {
      ...opts,
      headers,
    });
  } catch {
    throw new Error("Can't reach the API. Check that the backend is running.");
  }

  if (res.status === 401 && !path.includes("/api/auth/login")) {
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback("Your session expired. Please sign in again.");
    }
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status}).`;
    try {
      const p = await res.json();
      msg = p.errors ? Object.values(p.errors).flat().join(" ") : p.detail || p.title || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.status === 204 ? null : res.json();
}
