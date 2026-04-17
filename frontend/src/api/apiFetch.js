import { tokenManager } from "../lib/tokenManager";

export async function apiFetch(url, options = {}) {
  let token;

  try {
    token = await tokenManager.getValidToken();
  } catch {
    window.dispatchEvent(new Event("auth:logout"));
    throw new Error("Session expired");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    tokenManager.clear();
    window.dispatchEvent(new Event("auth:logout"));
    throw new Error("Unauthorized");
  }

  return response;
}