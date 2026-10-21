import { GRADING_SCALE, PASSING_PERCENTAGE } from "./constants.js";

/**
 * Format numeric value as currency
 * @param {number|string} amount 
 * @param {string} currencySymbol 
 * @returns {string} e.g. "₹ 15,500"
 */
export function formatCurrency(amount, currencySymbol = "₹") {
  const num = Number(amount) || 0;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
  return `${currencySymbol} ${formatted}`;
}

/**
 * Format ISO date string to readable format
 * @param {string|Date} dateInput 
 * @returns {string} e.g. "15 Apr 2026"
 */
export function formatDate(dateInput) {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format numeric percentage
 * @param {number|string} value 
 * @returns {string} e.g. "87.5%"
 */
export function formatPercentage(value) {
  const num = Number(value) || 0;
  return `${num.toFixed(1)}%`;
}

/**
 * Calculate Grade, Grade Point, and Remark from percentage
 * @param {number} percentage 
 */
export function calculateGrade(percentage) {
  const pct = Number(percentage) || 0;
  for (const scale of GRADING_SCALE) {
    if (pct >= scale.minPercentage && pct <= scale.maxPercentage) {
      return {
        grade: scale.grade,
        gradePoint: scale.gradePoint,
        remark: scale.remark,
        isPassed: pct >= PASSING_PERCENTAGE,
      };
    }
  }
  return {
    grade: "E",
    gradePoint: 0.0,
    remark: "Needs Improvement",
    isPassed: false,
  };
}

/**
 * Convert numbers to Indian English Words for Fee Receipts
 * e.g. 15250 -> "Rupees Fifteen Thousand Two Hundred Fifty Only"
 */
export function amountToWords(num) {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Rupees Zero Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(val) {
    let str = "";
    if (val >= 10000000) {
      str += inWords(Math.floor(val / 10000000)) + " Crore ";
      val %= 10000000;
    }
    if (val >= 100000) {
      str += inWords(Math.floor(val / 100000)) + " Lakh ";
      val %= 100000;
    }
    if (val >= 1000) {
      str += inWords(Math.floor(val / 1000)) + " Thousand ";
      val %= 1000;
    }
    if (val >= 100) {
      str += inWords(Math.floor(val / 100)) + " Hundred ";
      val %= 100;
    }
    if (val > 0) {
      if (val < 20) {
        str += a[val];
      } else {
        str += b[Math.floor(val / 10)];
        if (val % 10 > 0) str += " " + a[val % 10];
      }
    }
    return str.trim();
  }

  const result = inWords(n);
  return `Rupees ${result} Only`;
}
