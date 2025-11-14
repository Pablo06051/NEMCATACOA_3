const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function apiRequest(path, { method = "GET", data, token, headers } = {}) {
  const config = {
    method,
    headers: {
      ...(headers || {}),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
    config.headers["Content-Type"] = "application/json";
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, config);
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const error = new Error(payload?.error || "Error en la solicitud");
    error.status = res.status;
    throw error;
  }

  return payload;
}

export { API_URL, apiRequest };
