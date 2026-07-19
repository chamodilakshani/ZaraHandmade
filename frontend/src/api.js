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
  getProducts: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.productType) params.set('productType', filters.productType);
    const query = params.toString();
    return request(`/api/products${query ? `?${query}` : ''}`);
  },
  addProduct: (product) => request('/api/products', { method: 'POST', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
  getOrders: () => request('/api/orders'),
  placeOrder: (order) => request('/api/orders', { method: 'POST', body: JSON.stringify(order) }),
  completeOrder: (id) => request(`/api/orders/${id}/complete`, { method: 'PATCH' }),
  getTestimonials: () => request('/api/testimonials'),
  addTestimonial: (testimonial) => request('/api/testimonials', { method: 'POST', body: JSON.stringify(testimonial) }),
  deleteTestimonial: (id) => request(`/api/testimonials/${id}`, { method: 'DELETE' }),
  subscribeNewsletter: (email) => request('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),
  getGreetingTemplates: () => request('/api/greeting-templates'),
  addGreetingTemplate: (template) => request('/api/greeting-templates', { method: 'POST', body: JSON.stringify(template) }),
  deleteGreetingTemplate: (id) => request(`/api/greeting-templates/${id}`, { method: 'DELETE' })
};