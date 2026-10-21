/**
 * Client-side Fee Service
 */

export const feeService = {
  async getFeeStructures(session, className) {
    const params = new URLSearchParams();
    if (session) params.append("session", session);
    if (className) params.append("className", className);

    const res = await fetch(`/api/fees/structures?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch fee structures");
    return data.data;
  },

  async saveFeeStructure(payload) {
    const res = await fetch("/api/fees/structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to save fee structure");
    return data.data;
  },

  async getPayments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.admissionNumber) params.append("admissionNumber", filters.admissionNumber);
    if (filters.session) params.append("session", filters.session);
    if (filters.className) params.append("className", filters.className);
    if (filters.receiptNumber) params.append("receiptNumber", filters.receiptNumber);

    const res = await fetch(`/api/fees/payments?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch payments");
    return data.data;
  },

  async recordPayment(payload) {
    const res = await fetch("/api/fees/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to record payment");
    return data.data;
  },

  async getPendingReport(session, className, admissionNumber) {
    const params = new URLSearchParams();
    if (session) params.append("session", session);
    if (className) params.append("className", className);
    if (admissionNumber) params.append("admissionNumber", admissionNumber);

    const res = await fetch(`/api/fees/pending?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to calculate pending fees");
    return data;
  },
};

export default feeService;
