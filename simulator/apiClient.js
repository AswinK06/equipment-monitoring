const { API_BASE, SIM_EMAIL, SIM_PASSWORD } = require("./config");

let authToken = null;

async function login() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SIM_EMAIL, password: SIM_PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`Authentication failed with status ${res.status}`);
  }

  const data = await res.json();
  authToken = data.accessToken;
  return authToken;
}

async function requestEquipment() {
  if (!authToken) {
    await login();
  }

  const res = await fetch(`${API_BASE}/api/equipment`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (res.status === 401) {
    await login();
    const retryRes = await fetch(`${API_BASE}/api/equipment`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!retryRes.ok) {
      throw new Error(`Failed to fetch equipment after re-auth: ${retryRes.status}`);
    }
    return retryRes.json();
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch equipment: ${res.status}`);
  }

  return res.json();
}

async function fetchEquipment() {
  const items = await requestEquipment();
  if (!Array.isArray(items)) {
    throw new Error("Invalid equipment response format");
  }
  return items;
}

module.exports = {
  login,
  fetchEquipment,
};
