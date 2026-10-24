/**
 * Client-side Examination and Marks Service
 */

export const examService = {
  async getExaminations() {
    const res = await fetch("/api/academics/examinations");
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch examinations");
    return data.data;
  },

  async createExamination(payload) {
    const res = await fetch("/api/academics/examinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create examination");
    return data.data;
  },

  async getSchedule(examName, session, className) {
    const params = new URLSearchParams({ type: "schedule" });
    if (examName) params.append("examName", examName);
    if (session) params.append("session", session);
    if (className) params.append("className", className);

    const res = await fetch(`/api/academics/examinations?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch exam schedule");
    return data.data;
  },

  async saveScheduleItem(item) {
    const res = await fetch("/api/academics/examinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "schedule_item", data: item }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to save schedule item");
    return data.data;
  },

  async getMarks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.admissionNumber) params.append("admissionNumber", filters.admissionNumber);
    if (filters.session) params.append("session", filters.session);
    if (filters.examName) params.append("examName", filters.examName);
    if (filters.className) params.append("className", filters.className);

    const res = await fetch(`/api/marks?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch marks");
    return data.data;
  },

  async saveMarksBatch(payload) {
    const res = await fetch("/api/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to save marks");
    return data.data;
  },

  async checkExaminationDependencies(nameOrId) {
    const res = await fetch(`/api/academics/examinations?type=dependencies&name=${encodeURIComponent(nameOrId)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to check examination dependencies");
    return data.data;
  },

  async deleteExamination(nameOrId, cascade = false) {
    const res = await fetch("/api/academics/examinations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameOrId, cascade }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "Failed to delete examination");
      err.requiresConfirmation = data.requiresConfirmation;
      err.dependencies = data.dependencies;
      throw err;
    }
    return data.data;
  },

  async deleteScheduleItem(id) {
    const res = await fetch(`/api/academics/examinations?type=schedule_item&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to delete schedule item");
    return data.data;
  },
};

export default examService;
