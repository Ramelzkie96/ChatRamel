const API_URL = import.meta.env.VITE_API_URL || "https://chatramel.onrender.com/api";

// "http://localhost:5000" (the API address without "/api")
export const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

// "/uploads/covers/a.png" -> "http://localhost:5000/uploads/covers/a.png"
export const assetUrl = (path) => {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${SERVER_URL}${path}`;
};

async function request(path, { method = "GET", body, form } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include", // sends and receives the httpOnly cookie
      // for FormData the browser sets its own Content-Type (with the boundary)
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new Error("Can't reach the server. Please check your connection.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: body ?? {} }),
  put: (path, body) => request(path, { method: "PUT", body: body ?? {} }),
  patch: (path, body) => request(path, { method: "PATCH", body: body ?? {} }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: (path, formData) => request(path, { method: "POST", form: formData }),
};

// Downloads a protected file (the cookie is sent) and saves it under `filename`.
// Errors become normal exceptions, so the app never navigates away to a JSON error page.
export async function downloadFile(path, filename) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  } catch {
    throw new Error("Can't reach the server. Please check your connection.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Download failed.");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}