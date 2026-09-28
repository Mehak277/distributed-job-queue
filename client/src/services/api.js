const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  baseUrl: API_BASE,
  getStats: () => request("/jobs/stats"),
  getJobs: ({ page = 1, limit = 10, status = "", priority = "" } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    return request(`/jobs?${params.toString()}`);
  },
  getFailedJobs: () => request("/jobs/failed"),
  getJob: (id) => request(`/jobs/${id}`),
  retryJob: (id) => request(`/jobs/${id}/retry`, { method: "POST" }),
};