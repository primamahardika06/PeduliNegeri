const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("pn_token");
  const response = await fetch(`${API_URL}/reports${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token || ""}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      result.message || "Permintaan laporan gagal. Silakan coba lagi.",
    );
  }
  return result.data;
}

export const reportService = {
  async getMyReports() {
    return request("");
  },

  async getAllReports() {
    return request("/admin");
  },

  async createReport(report) {
    return request("", {
      method: "POST",
      body: JSON.stringify(report),
    });
  },

  async updateStatus(reportId, status) {
    return request(`/${encodeURIComponent(reportId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async getPublicReports() {
    return request("/public");
  },

  async getPublicStats() {
    return request("/stats/public");
  },

  async getLeaderboard() {
    return request("/leaderboard");
  },
};
