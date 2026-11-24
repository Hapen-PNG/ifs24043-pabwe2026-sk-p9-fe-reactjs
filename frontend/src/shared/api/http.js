const defaultApiUrl = "http://localhost:8080/api";

export async function request(path, options = {}) {
  const { token, method = "GET", body, signal } = options;
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${import.meta.env.VITE_API_URL || defaultApiUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  let envelope;
  try {
    envelope = await response.json();
  } catch {
    throw new Error("Respons server tidak valid");
  }
  if (!response.ok || envelope.status !== "success") {
    throw new Error(envelope.message || "Permintaan tidak berhasil");
  }
  return envelope.data ?? {};
}

export { defaultApiUrl };
