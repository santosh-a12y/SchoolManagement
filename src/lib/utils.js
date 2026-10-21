/**
 * Simple Class Names utility (concatenates truthy string classes)
 * Helpful for keeping Tailwind class combinations readable.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate formatted Admission Number
 * @param {number|string} seq Sequence number, e.g. 1
 * @param {string} year Academic year prefix, e.g. "2026"
 * @returns {string} e.g. "ADM-2026-001"
 */
export function generateAdmissionNumber(seq = 1, year = new Date().getFullYear()) {
  const padded = String(seq).padStart(3, "0");
  return `ADM-${year}-${padded}`;
}

/**
 * Generate formatted Fee Receipt Number
 * @param {number|string} seq 
 * @param {string} year 
 * @returns {string} e.g. "RCP-2026-0001"
 */
export function generateReceiptNumber(seq = 1, year = new Date().getFullYear()) {
  const padded = String(seq).padStart(4, "0");
  return `RCP-${year}-${padded}`;
}

/**
 * Trigger browser file download from a Blob
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
