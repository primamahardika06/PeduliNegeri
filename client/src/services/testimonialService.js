const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const testimonialService = {
  async getTestimonials() {
    try {
      const response = await fetch(`${API_URL}/testimonials`);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal memuat ulasan.");
      }
      return result.data || [];
    } catch {
      return [];
    }
  },

  async createTestimonial({ report_id, content, rating = 5 }) {
    const token = localStorage.getItem("pn_token");
    const response = await fetch(`${API_URL}/testimonials`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ report_id, content, rating }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Gagal mengirim ulasan.");
    }
    return result;
  },
};

