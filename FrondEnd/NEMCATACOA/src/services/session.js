function getStoredToken() {
  return localStorage.getItem('nemcatacoaToken') || null;
}

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    if (!base64) return null;
    const json = atob(base64);
    return JSON.parse(json);
  } catch (_err) {
    return null;
  }
}

function getSession() {
  const token = getStoredToken();
  if (!token) return { token: null, user: null };
  const user = parseJwtPayload(token) || null; // { id, email, rol } esperado
  return { token, user };
}

export { getStoredToken, getSession };
