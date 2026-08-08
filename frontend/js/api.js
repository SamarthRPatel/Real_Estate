// Points at the backend's own Render URL, since frontend and backend
// are deployed as separate services with no shared origin. For local
// dev (npm start in backend/) or any single-service deployment, set
// this to "" instead to use relative "/api/..." calls.
const API_BASE = "https://real-estate-api-yv53.onrender.com";

export async function apiFetch(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/${path}`, {
      method,
      credentials: "include",
      headers: body
        ? { "Content-Type": "application/json" }
        : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch() itself throws (not an HTTP error response) on network
    // failures, CORS blocks, DNS issues, etc. — none of which have
    // anything to do with what the user typed, so don't let it read
    // like a validation error.
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

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