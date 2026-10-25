/**
 * School Management System Constants
 */

export const ACADEMIC_SESSIONS = [
  { id: "2026-27", name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31", isActive: true },
  { id: "2025-26", name: "2025-26", startDate: "2025-04-01", endDate: "2026-03-31", isActive: false },
  { id: "2024-25", name: "2024-25", startDate: "2024-04-01", endDate: "2025-03-31", isActive: false },
];

export const SCHOOL_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

export const SECTIONS = ["A", "B", "C", "D"];

export const GENDERS = ["Male", "Female", "Other"];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const STUDENT_STATUSES = [
  { value: "Active", label: "Active", color: "emerald" },
  { value: "Inactive", label: "Inactive", color: "slate" },
  { value: "Transferred", label: "Transferred", color: "amber" },
  { value: "Graduated", label: "Graduated", color: "blue" },
];

export const FEE_CATEGORIES = [
  { id: "admission_fee", name: "Admission Fee", frequency: "One-time" },
  { id: "tuition_fee", name: "Tuition Fee", frequency: "Quarterly" },
  { id: "examination_fee", name: "Examination Fee", frequency: "Per Exam" },
  { id: "transport_fee", name: "Transport Fee", frequency: "Monthly" },
  { id: "lab_computer_fee", name: "Computer & Science Lab Fee", frequency: "Annual" },
  { id: "library_fee", name: "Library & Reading Room Fee", frequency: "Annual" },
  { id: "annual_charges", name: "Development & Annual Charges", frequency: "Annual" },
];

export const PAYMENT_MODES = [
  { value: "Cash", label: "Cash" },
  { value: "UPI", label: "UPI / QR Code" },
  { value: "Bank Transfer", label: "Bank Transfer (NEFT/RTGS/IMPS)" },
  { value: "Cheque", label: "Cheque" },
  { value: "Demand Draft", label: "Demand Draft (DD)" },
];

export const EXAMINATIONS = [
  { id: "test_01", name: "Test-01", term: "Term 1", weightage: 20 },
  { id: "test_02", name: "Test-02", term: "Term 1", weightage: 20 },
  { id: "annual_exam", name: "Annual Exam", term: "Final", weightage: 60 },
];

export const STANDARD_SUBJECTS = {
  primary: ["English", "Mathematics", "Science", "Social Studies", "Hindi", "General Knowledge"],
  middle: ["English", "Mathematics", "General Science", "Social Science", "Hindi", "Computer Science"],
  secondary: ["English Language & Lit.", "Mathematics", "Science", "Social Science", "Hindi Course-A", "Information Technology"],
};

export const GRADING_SCALE = [
  { minPercentage: 91, maxPercentage: 100, grade: "A1", gradePoint: 10.0, remark: "Outstanding" },
  { minPercentage: 81, maxPercentage: 90.99, grade: "A2", gradePoint: 9.0, remark: "Excellent" },
  { minPercentage: 71, maxPercentage: 80.99, grade: "B1", gradePoint: 8.0, remark: "Very Good" },
  { minPercentage: 61, maxPercentage: 70.99, grade: "B2", gradePoint: 7.0, remark: "Good" },
  { minPercentage: 51, maxPercentage: 60.99, grade: "C1", gradePoint: 6.0, remark: "Fair" },
  { minPercentage: 41, maxPercentage: 50.99, grade: "C2", gradePoint: 5.0, remark: "Average" },
  { minPercentage: 33, maxPercentage: 40.99, grade: "D", gradePoint: 4.0, remark: "Pass" },
  { minPercentage: 0, maxPercentage: 32.99, grade: "E", gradePoint: 0.0, remark: "Needs Improvement (Fail)" },
];

export const PASSING_PERCENTAGE = 33;

/**
 * Determine next academic class for annual promotion
 * @param {string} currentClass e.g. "Class 5", "Nursery", "Class 12"
 * @returns {string|null} e.g. "Class 6" or "Graduated"
 */
export function getNextSchoolClass(currentClass) {
  if (!currentClass) return null;
  const clean = String(currentClass).trim().toLowerCase();
  const idx = SCHOOL_CLASSES.findIndex((c) => c.trim().toLowerCase() === clean);
  if (idx !== -1 && idx < SCHOOL_CLASSES.length - 1) {
    return SCHOOL_CLASSES[idx + 1];
  }
  if (idx === SCHOOL_CLASSES.length - 1) {
    return "Graduated (Course Complete)";
  }
  return null;
}
