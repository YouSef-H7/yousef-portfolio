async function request(method, url, body, isForm = false) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: isForm ? {} : body ? { 'Content-Type': 'application/json' } : {},
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  content: () => request('GET', '/api/content'),
  save: (section, data) => request('PUT', `/api/content/${section}`, data),
  history: (section) => request('GET', `/api/content/${section}/history`),
  restore: (id) => request('POST', `/api/content/restore/${id}`),
  uploadPhoto: (slot, file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return request('POST', `/api/photos/${slot}`, fd, true);
  },
  removePhoto: (slot) => request('DELETE', `/api/photos/${slot}`),
  login: (username, password) => request('POST', '/api/auth/login', { username, password }),
  logout: () => request('POST', '/api/auth/logout'),
  me: () => request('GET', '/api/auth/me'),
  changePassword: (current, next) => request('POST', '/api/auth/password', { current, next }),
};
