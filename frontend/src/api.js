const API_URL = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('zara_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register: (username, password, role) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password, role }) }),
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getProducts: () => request('/api/products'),
  addProduct: (product) => request('/api/products', { method: 'POST', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
  getOrders: () => request('/api/orders'),
  placeOrder: (order) => request('/api/orders', { method: 'POST', body: JSON.stringify(order) }),
  completeOrder: (id) => request(`/api/orders/${id}/complete`, { method: 'PATCH' })
};
