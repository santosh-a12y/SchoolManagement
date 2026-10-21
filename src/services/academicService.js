/**
 * Client-side Academic Session & Class Service
 */

export const academicService = {
  async getSessions() {
    const res = await fetch("/api/academics/sessions");
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch academic sessions");
    return data.data;
  },

  async createSession(payload) {
    const res = await fetch("/api/academics/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create session");
    return data.data;
  },

  async setActiveSession(sessionId) {
    const res = await fetch("/api/academics/sessions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to set active session");
    return data.data;
  },

  async getClasses() {
    const res = await fetch("/api/academics/classes");
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch classes");
    return data.data;
  },

  async createClass(payload) {
    const res = await fetch("/api/academics/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create class");
    return data.data;
  },
};

export default academicService;
