const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function request(path, options = {}) {
  const { token, method = "GET", body, signal } = options;
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi nanti.");
    }
    throw error;
  }

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
