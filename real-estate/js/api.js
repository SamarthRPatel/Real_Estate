const API_BASE = "https://real-estate-api-gp1u.onrender.com";

export async function apiFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}/api/${path}`, {
    method,
    credentials: "include",
    headers: body
      ? { "Content-Type": "application/json" }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}