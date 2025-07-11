// Admin service for API calls

const API_BASE = "http://localhost:4000";

export async function fetchUsers(token) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchStores(token) {
  const res = await fetch(`${API_BASE}/admin/stores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
}

export async function createUser(token, userData) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function createStore(token, storeData) {
  const res = await fetch(`${API_BASE}/admin/stores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(storeData),
  });
  if (!res.ok) throw new Error("Failed to create store");
  return res.json();
}

export async function updateUser(token, userId, userData) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function updateStore(token, storeId, storeData) {
  const res = await fetch(`${API_BASE}/admin/stores/${storeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(storeData),
  });
  if (!res.ok) throw new Error("Failed to update store");
  return res.json();
}

export async function deleteUser(token, userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

export async function deleteStore(token, storeId) {
  const res = await fetch(`${API_BASE}/admin/stores/${storeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete store");
  return res.json();
}

export async function fetchDashboard(token) {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard analytics");
  return res.json();
} 