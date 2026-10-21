/**
 * Client-side Student Service
 */

export const studentService = {
  async getStudents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.session) params.append("session", filters.session);
    if (filters.className) params.append("className", filters.className);
    if (filters.section) params.append("section", filters.section);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);

    const res = await fetch(`/api/students?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch students");
    return data.data;
  },

  async getStudentByAdmissionNumber(admissionNumber) {
    const res = await fetch(`/api/students/${encodeURIComponent(admissionNumber)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch student profile");
    return data.data;
  },

  async createStudent(payload) {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to register student");
    return data.data;
  },

  async updateStudent(admissionNumber, payload) {
    const res = await fetch(`/api/students/${encodeURIComponent(admissionNumber)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update student");
    return data.data;
  },

  async archiveStudent(admissionNumber) {
    const res = await fetch(`/api/students/${encodeURIComponent(admissionNumber)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to archive student");
    return data.data;
  },

  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to upload photo");
    return data.url;
  },
};

export default studentService;
