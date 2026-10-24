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

  async checkClassDependencies(nameOrId) {
    const res = await fetch(`/api/academics/classes?type=dependencies&name=${encodeURIComponent(nameOrId)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to check class dependencies");
    return data.data;
  },

  async deleteClass(nameOrId, force = false) {
    const res = await fetch("/api/academics/classes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameOrId, force }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "Failed to delete class");
      err.requiresConfirmation = data.requiresConfirmation;
      err.dependencies = data.dependencies;
      throw err;
    }
    return data.data;
  },

  async updateClassSections(nameOrId, sections) {
    const res = await fetch("/api/academics/classes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameOrId, sections }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update class sections");
    return data.data;
  },

  async checkSectionDependencies(className, sectionName) {
    const res = await fetch(
      `/api/academics/classes?type=section_dependencies&name=${encodeURIComponent(className)}&section=${encodeURIComponent(sectionName)}`
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to check section dependencies");
    return data.data;
  },
};

export default academicService;
