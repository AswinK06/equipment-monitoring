export const API = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:5000";

/** Fetch JSON from the backend; throws Error with a readable message (RFC 7807 detail / validation errors). */
export async function api(path, opts = {}) {
  let res;
  try {
    res = await fetch(API + path, { headers: { "Content-Type": "application/json" }, ...opts });
  } catch {
    throw new Error("Can't reach the API. Check that the backend is running.");
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
