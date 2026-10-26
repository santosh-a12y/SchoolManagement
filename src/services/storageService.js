import fs from "fs/promises";
import path from "path";
import { isGoogleSheetsConfigured } from "../lib/google/auth.js";
import {
  getWorksheetData,
  appendWorksheetRow,
  setWorksheetData,
  invalidateWorksheetCache,
} from "../lib/google/sheets.js";
import appConfig from "../config/appConfig.js";
import { generateReceiptNumber, parseBoolean } from "../lib/utils.js";
import { calculateGrade } from "../lib/formatters.js";
import { DEFAULT_USERS } from "../lib/permissions.js";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "school_database.json");

/**
 * Initial Rich Seed Data for School Management System
 * Ensures the system is 100% operational in Demo/Offline mode immediately.
 */
function getInitialDatabase() {
  const defaultSession = appConfig.defaultSession || "2026-27";

  return {
    settings: {
      ...appConfig.school,
      activeSession: defaultSession,
      updatedAt: new Date().toISOString(),
    },
    academicSessions: [
      { id: "2026-27", name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31", isActive: true },
      { id: "2025-26", name: "2025-26", startDate: "2025-04-01", endDate: "2026-03-31", isActive: false },
      { id: "2024-25", name: "2024-25", startDate: "2024-04-01", endDate: "2025-03-31", isActive: false },
    ],
    classes: [
      { id: "cls-1", name: "Class 1", level: "Primary", sections: ["A", "B"] },
      { id: "cls-2", name: "Class 2", level: "Primary", sections: ["A", "B"] },
      { id: "cls-3", name: "Class 3", level: "Primary", sections: ["A", "B"] },
      { id: "cls-4", name: "Class 4", level: "Primary", sections: ["A", "B"] },
      { id: "cls-5", name: "Class 5", level: "Primary", sections: ["A", "B", "C"] },
      { id: "cls-6", name: "Class 6", level: "Middle", sections: ["A", "B"] },
      { id: "cls-7", name: "Class 7", level: "Middle", sections: ["A", "B"] },
      { id: "cls-8", name: "Class 8", level: "Middle", sections: ["A", "B"] },
      { id: "cls-9", name: "Class 9", level: "Secondary", sections: ["A", "B"] },
      { id: "cls-10", name: "Class 10", level: "Secondary", sections: ["A", "B"] },
    ],
    subjects: [
      { className: "Class 5", subjects: ["English", "Mathematics", "General Science", "Social Studies", "Hindi", "Computer"] },
      { className: "Class 10", subjects: ["English Language", "Mathematics", "Science", "Social Science", "Hindi Course-A", "Information Tech"] },
    ],
    examinations: [
      { id: "test_01", name: "Test-01", term: "Term 1", weightage: 20 },
      { id: "test_02", name: "Test-02", term: "Term 1", weightage: 20 },
      { id: "annual_exam", name: "Annual Exam", term: "Final", weightage: 60 },
    ],
    examinationSchedule: [
      {
        id: "sch-1",
        examinationName: "Annual Exam",
        academicSession: defaultSession,
        className: "Class 5",
        subject: "English",
        examDate: "2027-03-01",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        roomNumber: "Hall-A",
        maxMarks: 100,
        passMarks: 33,
      },
      {
        id: "sch-2",
        examinationName: "Annual Exam",
        academicSession: defaultSession,
        className: "Class 5",
        subject: "Mathematics",
        examDate: "2027-03-03",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        roomNumber: "Hall-A",
        maxMarks: 100,
        passMarks: 33,
      },
      {
        id: "sch-3",
        examinationName: "Annual Exam",
        academicSession: defaultSession,
        className: "Class 5",
        subject: "General Science",
        examDate: "2027-03-05",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        roomNumber: "Hall-A",
        maxMarks: 100,
        passMarks: 33,
      },
      {
        id: "sch-4",
        examinationName: "Annual Exam",
        academicSession: defaultSession,
        className: "Class 5",
        subject: "Social Studies",
        examDate: "2027-03-08",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        roomNumber: "Hall-A",
        maxMarks: 100,
        passMarks: 33,
      },
      {
        id: "sch-5",
        examinationName: "Annual Exam",
        academicSession: defaultSession,
        className: "Class 5",
        subject: "Hindi",
        examDate: "2027-03-10",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        roomNumber: "Hall-A",
        maxMarks: 100,
        passMarks: 33,
      },
    ],
    feeStructure: [
      { id: "fs-1", academicSession: defaultSession, className: "Class 5", category: "Admission Fee", amount: 10000, frequency: "One-time" },
      { id: "fs-2", academicSession: defaultSession, className: "Class 5", category: "Tuition Fee", amount: 24000, frequency: "Annual" },
      { id: "fs-3", academicSession: defaultSession, className: "Class 5", category: "Examination Fee", amount: 3000, frequency: "Annual" },
      { id: "fs-4", academicSession: defaultSession, className: "Class 5", category: "Transport Fee", amount: 12000, frequency: "Annual" },
      { id: "fs-5", academicSession: defaultSession, className: "Class 10", category: "Admission Fee", amount: 12000, frequency: "One-time" },
      { id: "fs-6", academicSession: defaultSession, className: "Class 10", category: "Tuition Fee", amount: 32000, frequency: "Annual" },
      { id: "fs-7", academicSession: defaultSession, className: "Class 10", category: "Examination Fee", amount: 4500, frequency: "Annual" },
      { id: "fs-8", academicSession: defaultSession, className: "Class 10", category: "Transport Fee", amount: 15000, frequency: "Annual" },
    ],
    students: [
      {
        admissionNumber: "ADM-2026-001",
        studentName: "Aarav Sharma",
        dateOfBirth: "2015-08-14",
        gender: "Male",
        bloodGroup: "B+",
        studentPhoto: "",
        contactNumber: "+91 98111 22334",
        email: "aarav.sharma@example.com",
        residentialAddress: "B-44, Palm Green Enclave, Sector 14, New Delhi",
        academicSession: defaultSession,
        className: "Class 5",
        section: "A",
        rollNumber: "01",
        admissionDate: "2026-04-02",
        status: "Active",
        fatherName: "Rajesh Sharma",
        fatherPhoto: "",
        fatherOccupation: "Civil Engineer",
        motherName: "Pooja Sharma",
        motherPhoto: "",
        motherOccupation: "Architect",
        guardianName: "",
        guardianRelation: "",
        parentContact: "+91 98111 22334",
        parentEmail: "rajesh.sharma@example.com",
        emergencyContact: "+91 98111 22335",
        createdAt: "2026-04-02T10:00:00.000Z",
      },
      {
        admissionNumber: "ADM-2026-002",
        studentName: "Ananya Iyer",
        dateOfBirth: "2015-11-20",
        gender: "Female",
        bloodGroup: "O+",
        studentPhoto: "",
        contactNumber: "+91 98222 33445",
        email: "ananya.iyer@example.com",
        residentialAddress: "Flat 302, Nilgiri Heights, Vasant Kunj, New Delhi",
        academicSession: defaultSession,
        className: "Class 5",
        section: "A",
        rollNumber: "02",
        admissionDate: "2026-04-03",
        status: "Active",
        fatherName: "Karthik Iyer",
        fatherPhoto: "",
        fatherOccupation: "Software Architect",
        motherName: "Meenakshi Iyer",
        motherPhoto: "",
        motherOccupation: "Professor",
        guardianName: "",
        guardianRelation: "",
        parentContact: "+91 98222 33445",
        parentEmail: "karthik.iyer@example.com",
        emergencyContact: "+91 98222 33446",
        createdAt: "2026-04-03T11:00:00.000Z",
      },
      {
        admissionNumber: "ADM-2026-003",
        studentName: "Rohan Verma",
        dateOfBirth: "2015-05-18",
        gender: "Male",
        bloodGroup: "A+",
        studentPhoto: "",
        contactNumber: "+91 98333 44556",
        email: "rohan.verma@example.com",
        residentialAddress: "House 12, Gulmohar Marg, Saket, New Delhi",
        academicSession: defaultSession,
        className: "Class 5",
        section: "B",
        rollNumber: "01",
        admissionDate: "2026-04-04",
        status: "Active",
        fatherName: "Sanjay Verma",
        fatherPhoto: "",
        fatherOccupation: "Chartered Accountant",
        motherName: "Sunita Verma",
        motherPhoto: "",
        motherOccupation: "School Teacher",
        guardianName: "",
        guardianRelation: "",
        parentContact: "+91 98333 44556",
        parentEmail: "sanjay.verma@example.com",
        emergencyContact: "+91 98333 44557",
        createdAt: "2026-04-04T09:30:00.000Z",
      },
      {
        admissionNumber: "ADM-2026-004",
        studentName: "Diya Patel",
        dateOfBirth: "2010-02-11",
        gender: "Female",
        bloodGroup: "AB+",
        studentPhoto: "",
        contactNumber: "+91 98444 55667",
        email: "diya.patel@example.com",
        residentialAddress: "Plot 88, Heritage Park, Dwarka, New Delhi",
        academicSession: defaultSession,
        className: "Class 10",
        section: "A",
        rollNumber: "14",
        admissionDate: "2026-04-05",
        status: "Active",
        fatherName: "Bhavin Patel",
        fatherPhoto: "",
        fatherOccupation: "Businessman",
        motherName: "Rita Patel",
        motherPhoto: "",
        motherOccupation: "Interior Designer",
        guardianName: "",
        guardianRelation: "",
        parentContact: "+91 98444 55667",
        parentEmail: "bhavin.patel@example.com",
        emergencyContact: "+91 98444 55668",
        createdAt: "2026-04-05T14:15:00.000Z",
      },
      {
        admissionNumber: "ADM-2026-005",
        studentName: "Kabir Khan",
        dateOfBirth: "2010-09-04",
        gender: "Male",
        bloodGroup: "O-",
        studentPhoto: "",
        contactNumber: "+91 98555 66778",
        email: "kabir.khan@example.com",
        residentialAddress: "C-15, Rose Avenue, Greater Kailash, New Delhi",
        academicSession: defaultSession,
        className: "Class 10",
        section: "B",
        rollNumber: "08",
        admissionDate: "2026-04-06",
        status: "Active",
        fatherName: "Tariq Khan",
        fatherPhoto: "",
        fatherOccupation: "Doctor (Surgeon)",
        motherName: "Farida Khan",
        motherPhoto: "",
        motherOccupation: "Dentist",
        guardianName: "",
        guardianRelation: "",
        parentContact: "+91 98555 66778",
        parentEmail: "tariq.khan@example.com",
        emergencyContact: "+91 98555 66779",
        createdAt: "2026-04-06T12:00:00.000Z",
      },
    ],
    marks: [
      {
        id: "mrk-1",
        admissionNumber: "ADM-2026-001",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "English",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 92,
        isAbsent: false,
        grade: "A1",
        remarks: "Outstanding comprehension and vocabulary",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-2",
        admissionNumber: "ADM-2026-001",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "Mathematics",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 95,
        isAbsent: false,
        grade: "A1",
        remarks: "Exemplary analytical skills",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-3",
        admissionNumber: "ADM-2026-001",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "General Science",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 88,
        isAbsent: false,
        grade: "A2",
        remarks: "Great conceptual clarity",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-4",
        admissionNumber: "ADM-2026-001",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "Social Studies",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 85,
        isAbsent: false,
        grade: "A2",
        remarks: "Very good understanding of history",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-5",
        admissionNumber: "ADM-2026-001",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "Hindi",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 90,
        isAbsent: false,
        grade: "A2",
        remarks: "Fluent grammar and writing",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      // Student 2: Ananya Iyer
      {
        id: "mrk-6",
        admissionNumber: "ADM-2026-002",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "English",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 96,
        isAbsent: false,
        grade: "A1",
        remarks: "Brilliant creative expression",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-7",
        admissionNumber: "ADM-2026-002",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "Mathematics",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 98,
        isAbsent: false,
        grade: "A1",
        remarks: "Perfect problem solving",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-8",
        admissionNumber: "ADM-2026-002",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "General Science",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 94,
        isAbsent: false,
        grade: "A1",
        remarks: "Exceptional lab inquiry",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-9",
        admissionNumber: "ADM-2026-002",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "Social Studies",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 91,
        isAbsent: false,
        grade: "A1",
        remarks: "Thorough knowledge",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
      {
        id: "mrk-10",
        admissionNumber: "ADM-2026-002",
        academicSession: defaultSession,
        examinationName: "Annual Exam",
        className: "Class 5",
        section: "A",
        subject: "Hindi",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 89,
        isAbsent: false,
        grade: "A2",
        remarks: "Very good handwriting and grammar",
        recordedAt: "2027-03-12T10:00:00.000Z",
      },
    ],
    feePayments: [
      {
        receiptNumber: "RCP-2026-0001",
        admissionNumber: "ADM-2026-001",
        studentName: "Aarav Sharma",
        academicSession: defaultSession,
        className: "Class 5",
        feeCategory: "Admission Fee",
        amountPaid: 10000,
        paymentMode: "Bank Transfer",
        paymentDate: "2026-04-02",
        transactionRef: "NEFT-HDFC-9921",
        receivedBy: "Accounts Staff",
        remarks: "Full admission fee paid upon admission",
        createdAt: "2026-04-02T10:30:00.000Z",
      },
      {
        receiptNumber: "RCP-2026-0002",
        admissionNumber: "ADM-2026-001",
        studentName: "Aarav Sharma",
        academicSession: defaultSession,
        className: "Class 5",
        feeCategory: "Tuition Fee",
        amountPaid: 12000,
        paymentMode: "UPI",
        paymentDate: "2026-04-10",
        transactionRef: "UPI-ICICI-88124",
        receivedBy: "Accounts Staff",
        remarks: "Term-1 Tuition Fee (50%)",
        createdAt: "2026-04-10T11:00:00.000Z",
      },
      {
        receiptNumber: "RCP-2026-0003",
        admissionNumber: "ADM-2026-002",
        studentName: "Ananya Iyer",
        academicSession: defaultSession,
        className: "Class 5",
        feeCategory: "Admission Fee",
        amountPaid: 10000,
        paymentMode: "Cheque",
        paymentDate: "2026-04-03",
        transactionRef: "CHQ-SBI-554410",
        receivedBy: "Accounts Staff",
        remarks: "Admission Fee cleared",
        createdAt: "2026-04-03T11:30:00.000Z",
      },
      {
        receiptNumber: "RCP-2026-0004",
        admissionNumber: "ADM-2026-002",
        studentName: "Ananya Iyer",
        academicSession: defaultSession,
        className: "Class 5",
        feeCategory: "Tuition Fee",
        amountPaid: 24000,
        paymentMode: "Bank Transfer",
        paymentDate: "2026-04-05",
        transactionRef: "RTGS-AXIS-77119",
        receivedBy: "Accounts Staff",
        remarks: "Annual Tuition Fee full advance payment",
        createdAt: "2026-04-05T14:00:00.000Z",
      },
    ],
    auditLog: [
      {
        id: "aud-1",
        action: "INIT_SYSTEM",
        entity: "System",
        entityId: "APP-01",
        details: "Student Management System database initialized",
        performedBy: "System Administrator",
        timestamp: new Date().toISOString(),
      },
    ],
    users: DEFAULT_USERS,
  };
}

/**
 * Read the local database JSON file with automatic fallback initialization
 */
async function readLocalDatabase() {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = DEFAULT_USERS;
      try {
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      } catch {}
    } else {
      // Ensure passwords and usernames are assigned
      let hasUpdates = false;
      parsed.users = parsed.users.map((u) => {
        const defaultMatch = DEFAULT_USERS.find((d) => d.id === u.id);
        const username = u.username || defaultMatch?.username || u.email?.split("@")[0] || u.id;
        const password = u.password || defaultMatch?.password || "staff123";
        if (u.username !== username || u.password !== password) {
          hasUpdates = true;
          return { ...u, username, password };
        }
        return u;
      });
      if (hasUpdates) {
        try {
          await fs.writeFile(DATA_FILE_PATH, JSON.stringify(parsed, null, 2), "utf-8");
        } catch {}
      }
    }
    return parsed;
  } catch (err) {
    if (err.code === "ENOENT" || !err) {
      const initial = getInitialDatabase();
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    throw err;
  }
}

/**
 * Write updated data back to local database file atomically
 */
async function writeLocalDatabase(data) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    if (err.code === "EROFS" || err.message?.includes("read-only")) {
      // In serverless environments (Netlify, Vercel, AWS Lambda), the local filesystem is read-only.
      console.warn("Read-only filesystem detected (Serverless environment). Skipped local database file write.");
      return;
    }
    throw err;
  }
}

/**
 * Master Storage Service API
 */
export const storageService = {
  /**
   * Get Storage Connection Status
   */
  async getConnectionStatus() {
    const isConfigured = isGoogleSheetsConfigured();
    const sheetId = process.env.GOOGLE_SHEET_ID || "";
    const db = await readLocalDatabase();
    const schoolSettings = await this.getSettings();

    return {
      mode: isConfigured ? "google_sheets" : "demo_local",
      isConfigured,
      sheetId: isConfigured ? sheetId.slice(0, 8) + "..." : null,
      activeSession: schoolSettings.activeSession || db.settings?.activeSession || appConfig.defaultSession,
      school: schoolSettings,
      stats: {
        studentsCount: db.students.length,
        paymentsCount: db.feePayments.length,
        sessionsCount: db.academicSessions.length,
        marksCount: db.marks.length,
      },
    };
  },

  /**
   * Students CRUD
   */
  async getStudents(filters = {}) {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Students");
        return this._filterStudents(rows, filters);
      } catch (err) {
        console.error("Google Sheets read failed, falling back to local:", err.message);
      }
    }

    const db = await readLocalDatabase();
    return this._filterStudents(db.students, filters);
  },

  _filterStudents(students, filters) {
    let result = [...students];
    if (filters.session) {
      result = result.filter((s) => s.academicSession === filters.session);
    }
    if (filters.className) {
      result = result.filter((s) => s.className === filters.className);
    }
    if (filters.section) {
      result = result.filter((s) => s.section === filters.section);
    }
    if (filters.status) {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.admissionNumber?.toLowerCase().includes(q) ||
          s.studentName?.toLowerCase().includes(q) ||
          s.parentContact?.toLowerCase().includes(q) ||
          s.rollNumber?.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getStudentByAdmissionNumber(admissionNumber) {
    if (!admissionNumber) return null;
    const students = await this.getStudents();
    return students.find((s) => s.admissionNumber?.trim() === admissionNumber.trim()) || null;
  },

  async createStudent(studentData) {
    const existing = await this.getStudentByAdmissionNumber(studentData.admissionNumber);
    if (existing) {
      throw new Error(`Student with Admission Number ${studentData.admissionNumber} already exists.`);
    }

    const record = {
      ...studentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isGoogleSheetsConfigured()) {
      try {
        await appendWorksheetRow(process.env.GOOGLE_SHEET_ID, "Students", record);
      } catch (err) {
        console.error("Google Sheets write failed:", err.message);
      }
    }

    // Always maintain local persistent mirror
    const db = await readLocalDatabase();
    db.students.push(record);
    db.auditLog.push({
      id: `aud-${Date.now()}`,
      action: "CREATE_STUDENT",
      entity: "Student",
      entityId: record.admissionNumber,
      details: `Admitted student ${record.studentName} in ${record.className}-${record.section}`,
      performedBy: "Staff",
      timestamp: new Date().toISOString(),
    });
    await writeLocalDatabase(db);

    return record;
  },

  async updateStudent(admissionNumber, updatedFields) {
    if (isGoogleSheetsConfigured()) {
      const liveStudents = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Students");
      const idx = liveStudents.findIndex((s) => s.admissionNumber === admissionNumber);
      if (idx === -1) {
        throw new Error(`Student ${admissionNumber} not found.`);
      }

      const updated = {
        ...liveStudents[idx],
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };
      liveStudents[idx] = updated;

      // Only write live students back to Google Sheets — NEVER inject local mock students!
      await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Students", liveStudents);

      // Mirror update to local DB if student exists locally
      try {
        const db = await readLocalDatabase();
        const localIdx = db.students.findIndex((s) => s.admissionNumber === admissionNumber);
        if (localIdx >= 0) {
          db.students[localIdx] = updated;
          await writeLocalDatabase(db);
        }
      } catch {}

      return updated;
    }

    const db = await readLocalDatabase();
    const idx = db.students.findIndex((s) => s.admissionNumber === admissionNumber);
    if (idx === -1) {
      throw new Error(`Student ${admissionNumber} not found.`);
    }

    const updated = {
      ...db.students[idx],
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    db.students[idx] = updated;

    db.auditLog.push({
      id: `aud-${Date.now()}`,
      action: "UPDATE_STUDENT",
      entity: "Student",
      entityId: admissionNumber,
      details: `Updated details for ${updated.studentName}`,
      performedBy: "Staff",
      timestamp: new Date().toISOString(),
    });

    await writeLocalDatabase(db);
    return updated;
  },

  async deleteStudent(admissionNumber) {
    if (isGoogleSheetsConfigured()) {
      const liveStudents = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Students");
      const idx = liveStudents.findIndex((s) => s.admissionNumber === admissionNumber);
      if (idx === -1) {
        throw new Error(`Student ${admissionNumber} not found.`);
      }

      // Soft delete by setting status to Inactive
      liveStudents[idx].status = "Inactive";
      liveStudents[idx].updatedAt = new Date().toISOString();

      await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Students", liveStudents);

      try {
        const db = await readLocalDatabase();
        const localIdx = db.students.findIndex((s) => s.admissionNumber === admissionNumber);
        if (localIdx >= 0) {
          db.students[localIdx].status = "Inactive";
          await writeLocalDatabase(db);
        }
      } catch {}

      return liveStudents[idx];
    }

    const db = await readLocalDatabase();
    const idx = db.students.findIndex((s) => s.admissionNumber === admissionNumber);
    if (idx === -1) {
      throw new Error(`Student ${admissionNumber} not found.`);
    }

    // Soft delete / archive by marking status as Inactive
    db.students[idx].status = "Inactive";
    db.students[idx].updatedAt = new Date().toISOString();

    db.auditLog.push({
      id: `aud-${Date.now()}`,
      action: "ARCHIVE_STUDENT",
      entity: "Student",
      entityId: admissionNumber,
      details: `Archived student ${admissionNumber}`,
      performedBy: "Staff",
      timestamp: new Date().toISOString(),
    });

    await writeLocalDatabase(db);
    return db.students[idx];
  },

  /**
   * Academic Sessions
   */
  async getAcademicSessions() {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "AcademicSessions");
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            isActive: r.isActive === true || r.isActive === "true",
          }));
        } else {
          // Initialize Google Sheets with default sessions
          const initialSessions = getInitialDatabase().academicSessions.map((s) => ({
            ...s,
            createdAt: new Date().toISOString(),
          }));
          await setWorksheetData(process.env.GOOGLE_SHEET_ID, "AcademicSessions", initialSessions);
          return initialSessions;
        }
      } catch (err) {
        console.warn("Google Sheets AcademicSessions read failed, using fallback:", err.message);
      }
    }

    const db = await readLocalDatabase();
    return db.academicSessions || [];
  },

  async createAcademicSession(sessionData) {
    const newSession = {
      ...sessionData,
      isActive: Boolean(sessionData.isActive),
      createdAt: new Date().toISOString(),
    };

    if (isGoogleSheetsConfigured()) {
      try {
        const sessions = await this.getAcademicSessions();
        if (sessions.some((s) => s.id === sessionData.id)) {
          throw new Error(`Session ${sessionData.id} already exists.`);
        }
        if (newSession.isActive) {
          sessions.forEach((s) => (s.isActive = false));
          await this.updateSettings({ activeSession: newSession.id });
        }
        sessions.push(newSession);
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "AcademicSessions", sessions);
        invalidateWorksheetCache("AcademicSessions");
      } catch (err) {
        if (err.message?.includes("already exists")) throw err;
        console.error("Google Sheets createAcademicSession failed:", err.message);
      }
    }

    const db = await readLocalDatabase();
    const existing = db.academicSessions.find((s) => s.id === sessionData.id);
    if (existing && !isGoogleSheetsConfigured()) {
      throw new Error(`Session ${sessionData.id} already exists.`);
    }
    if (sessionData.isActive) {
      db.academicSessions.forEach((s) => (s.isActive = false));
      db.settings.activeSession = sessionData.id;
    }
    if (!existing) {
      db.academicSessions.push(newSession);
    }
    await writeLocalDatabase(db);
    return newSession;
  },

  async setActiveSession(sessionId) {
    if (isGoogleSheetsConfigured()) {
      try {
        const sessions = await this.getAcademicSessions();
        const found = sessions.find((s) => s.id === sessionId);
        if (!found) throw new Error(`Session ${sessionId} not found`);

        sessions.forEach((s) => (s.isActive = s.id === sessionId));
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "AcademicSessions", sessions);
        await this.updateSettings({ activeSession: sessionId });
        invalidateWorksheetCache("AcademicSessions");
      } catch (err) {
        console.error("Google Sheets setActiveSession failed:", err.message);
        if (err.message?.includes("not found")) throw err;
      }
    }

    const db = await readLocalDatabase();
    const session = db.academicSessions.find((s) => s.id === sessionId);
    if (!session && !isGoogleSheetsConfigured()) throw new Error(`Session ${sessionId} not found`);
    if (session) {
      db.academicSessions.forEach((s) => (s.isActive = s.id === sessionId));
      db.settings.activeSession = sessionId;
      await writeLocalDatabase(db);
    }
    return session || { id: sessionId, name: sessionId, isActive: true };
  },

  /**
   * Classes & Subjects
   */
  async getClasses() {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Classes");
        if (rows && rows.length > 0) {
          return rows.map((r) => {
            let sections = r.sections;
            if (typeof sections === "string") {
              try {
                if (sections.startsWith("[")) {
                  sections = JSON.parse(sections);
                } else {
                  sections = sections.split(",").map((s) => s.trim()).filter(Boolean);
                }
              } catch {
                sections = sections.split(",").map((s) => s.trim()).filter(Boolean);
              }
            }
            if (!Array.isArray(sections) || sections.length === 0) {
              sections = ["A", "B"];
            }
            return {
              ...r,
              sections,
            };
          });
        } else {
          // Initialize Google Sheets with default classes
          const initialClasses = getInitialDatabase().classes.map((c) => ({
            ...c,
            sections: Array.isArray(c.sections) ? c.sections.join(", ") : "A, B",
            createdAt: new Date().toISOString(),
          }));
          await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Classes", initialClasses);
          return getInitialDatabase().classes;
        }
      } catch (err) {
        console.warn("Google Sheets Classes read failed, using fallback:", err.message);
      }
    }

    const db = await readLocalDatabase();
    return db.classes || [];
  },

  async createClass(classData) {
    const rawSections = classData.sections || ["A", "B"];
    const sectionsArray = Array.isArray(rawSections)
      ? rawSections
      : String(rawSections).split(",").map((s) => s.trim()).filter(Boolean);

    const newClass = {
      id: `cls-${Date.now()}`,
      name: classData.name,
      level: classData.level || "Primary",
      sections: sectionsArray,
      createdAt: new Date().toISOString(),
    };

    if (isGoogleSheetsConfigured()) {
      try {
        const liveClasses = await this.getClasses();
        if (liveClasses.some((c) => c.name.toLowerCase() === classData.name.toLowerCase())) {
          throw new Error(`Class ${classData.name} already exists`);
        }
        await appendWorksheetRow(process.env.GOOGLE_SHEET_ID, "Classes", {
          id: newClass.id,
          name: newClass.name,
          level: newClass.level,
          sections: newClass.sections.join(", "),
          createdAt: newClass.createdAt,
        });
        invalidateWorksheetCache("Classes");
      } catch (err) {
        if (err.message?.includes("already exists")) throw err;
        console.error("Google Sheets createClass failed:", err.message);
      }
    }

    const db = await readLocalDatabase();
    const existing = db.classes.find((c) => c.name.toLowerCase() === classData.name.toLowerCase());
    if (existing && !isGoogleSheetsConfigured()) throw new Error(`Class ${classData.name} already exists`);
    if (!existing) {
      db.classes.push(newClass);
      await writeLocalDatabase(db);
    }
    return newClass;
  },

  async checkClassDependencies(classIdOrName) {
    const classes = await this.getClasses();
    const targetClass = classes.find(
      (c) => c.id === classIdOrName || c.name.toLowerCase() === String(classIdOrName).toLowerCase()
    );

    if (!targetClass) {
      throw new Error(`Class "${classIdOrName}" not found`);
    }

    // Get students in this class
    let students = [];
    try {
      const studentResult = await this.getStudents({ limit: 10000 });
      students = (studentResult.students || []).filter(
        (s) => s.className?.toLowerCase() === targetClass.name.toLowerCase()
      );
    } catch (err) {
      console.warn("Could not fetch students for dependency check:", err.message);
    }

    // Get exam schedules for this class
    let schedules = [];
    try {
      schedules = await this.getExaminationSchedule("", "", targetClass.name);
    } catch (err) {
      console.warn("Could not fetch schedules for dependency check:", err.message);
    }

    // Get marks for this class
    let marks = [];
    try {
      marks = await this.getMarks({ className: targetClass.name });
    } catch (err) {
      console.warn("Could not fetch marks for dependency check:", err.message);
    }

    const hasDependencies = students.length > 0 || schedules.length > 0 || marks.length > 0;

    return {
      classItem: targetClass,
      studentsCount: students.length,
      schedulesCount: schedules.length,
      marksCount: marks.length,
      hasDependencies,
    };
  },

  async deleteClass(classIdOrName, force = false) {
    const deps = await this.checkClassDependencies(classIdOrName);
    const targetClass = deps.classItem;

    if (!force && deps.hasDependencies) {
      const details = [];
      if (deps.studentsCount > 0) details.push(`${deps.studentsCount} enrolled student(s)`);
      if (deps.schedulesCount > 0) details.push(`${deps.schedulesCount} timetable schedule(s)`);
      if (deps.marksCount > 0) details.push(`${deps.marksCount} mark record(s)`);
      throw new Error(
        `Class "${targetClass.name}" has related data (${details.join(", ")}). Confirmation required to delete.`
      );
    }

    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Classes");
        const remaining = rows.filter(
          (c) => c.id !== targetClass.id && c.name?.toLowerCase() !== targetClass.name.toLowerCase()
        );
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Classes", remaining);
        invalidateWorksheetCache("Classes");
      } catch (err) {
        console.error("Google Sheets deleteClass failed:", err.message);
        throw err;
      }
    }

    const db = await readLocalDatabase();
    db.classes = (db.classes || []).filter(
      (c) => c.id !== targetClass.id && c.name?.toLowerCase() !== targetClass.name.toLowerCase()
    );
    await writeLocalDatabase(db);

    return {
      success: true,
      deletedClass: targetClass.name,
      dependencies: deps,
    };
  },

  async updateClassSections(classIdOrName, newSections) {
    const classes = await this.getClasses();
    const targetClass = classes.find(
      (c) => c.id === classIdOrName || c.name.toLowerCase() === String(classIdOrName).toLowerCase()
    );
    if (!targetClass) {
      throw new Error(`Class "${classIdOrName}" not found`);
    }

    const cleanedSections = Array.from(
      new Set(
        (Array.isArray(newSections) ? newSections : String(newSections).split(","))
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      )
    );

    if (cleanedSections.length === 0) {
      throw new Error("A class must have at least one section.");
    }

    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Classes");
        const idx = rows.findIndex(
          (r) => r.id === targetClass.id || r.name?.toLowerCase() === targetClass.name.toLowerCase()
        );
        if (idx >= 0) {
          rows[idx] = {
            ...rows[idx],
            sections: cleanedSections.join(", "),
          };
        } else {
          rows.push({
            id: targetClass.id || `cls-${Date.now()}`,
            name: targetClass.name,
            level: targetClass.level || "Primary",
            sections: cleanedSections.join(", "),
            createdAt: targetClass.createdAt || new Date().toISOString(),
          });
        }
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Classes", rows);
        invalidateWorksheetCache("Classes");
      } catch (err) {
        console.error("Google Sheets updateClassSections failed:", err.message);
        throw err;
      }
    }

    const db = await readLocalDatabase();
    const localIdx = (db.classes || []).findIndex(
      (c) => c.id === targetClass.id || c.name.toLowerCase() === targetClass.name.toLowerCase()
    );
    if (localIdx >= 0) {
      db.classes[localIdx].sections = cleanedSections;
      await writeLocalDatabase(db);
    }

    return {
      id: targetClass.id,
      name: targetClass.name,
      level: targetClass.level,
      sections: cleanedSections,
    };
  },

  async checkSectionDependencies(className, sectionName) {
    let studentsCount = 0;
    let marksCount = 0;
    try {
      const studentResult = await this.getStudents({ limit: 10000 });
      const students = (studentResult.students || []).filter(
        (s) =>
          s.className?.toLowerCase() === String(className).toLowerCase() &&
          s.section?.trim().toUpperCase() === String(sectionName).trim().toUpperCase()
      );
      studentsCount = students.length;
    } catch (err) {
      console.warn("Could not check student section dependencies:", err.message);
    }

    try {
      const marks = await this.getMarks({ className });
      const sectionMarks = marks.filter(
        (m) => m.section?.trim().toUpperCase() === String(sectionName).trim().toUpperCase()
      );
      marksCount = sectionMarks.length;
    } catch (err) {
      console.warn("Could not check marks section dependencies:", err.message);
    }

    return {
      className,
      section: sectionName,
      studentsCount,
      marksCount,
      hasDependencies: studentsCount > 0 || marksCount > 0,
    };
  },

  async getSubjects(className) {
    const db = await readLocalDatabase();
    const found = db.subjects?.find((s) => s.className === className);
    if (found) return found.subjects;
    return ["English", "Mathematics", "Science", "Social Studies", "Hindi"];
  },

  /**
   * Examinations & Schedule
   */
  async getExaminations() {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Examinations");
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            weightage: Number(r.weightage) || 0,
          }));
        } else {
          // Initialize Google Sheets with default examinations
          const initialExams = getInitialDatabase().examinations.map((e) => ({
            ...e,
            createdAt: new Date().toISOString(),
          }));
          await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Examinations", initialExams);
          return initialExams;
        }
      } catch (err) {
        console.warn("Google Sheets Examinations read failed, using fallback:", err.message);
      }
    }

    const db = await readLocalDatabase();
    return db.examinations || [];
  },

  async createExamination(examData) {
    const newExam = {
      id: examData.id || `exam-${Date.now()}`,
      name: examData.name,
      term: examData.term || "Term 1",
      weightage: Number(examData.weightage) || 0,
      createdAt: new Date().toISOString(),
    };

    if (isGoogleSheetsConfigured()) {
      try {
        await appendWorksheetRow(process.env.GOOGLE_SHEET_ID, "Examinations", newExam);
        invalidateWorksheetCache("Examinations");
      } catch (err) {
        console.error("Google Sheets createExamination failed:", err.message);
      }
    }

    const db = await readLocalDatabase();
    db.examinations.push(newExam);
    await writeLocalDatabase(db);
    return newExam;
  },

  async checkExaminationDependencies(examIdOrName) {
    const examinations = await this.getExaminations();
    const targetExam = examinations.find(
      (e) => e.id === examIdOrName || e.name.toLowerCase() === String(examIdOrName).toLowerCase()
    );

    if (!targetExam) {
      throw new Error(`Examination "${examIdOrName}" not found`);
    }

    // Get schedules linked to this examination
    let schedules = [];
    try {
      schedules = await this.getExaminationSchedule(targetExam.name);
    } catch (err) {
      console.warn("Could not check exam schedule dependencies:", err.message);
    }

    // Get marks recorded under this examination
    let marks = [];
    try {
      marks = await this.getMarks({ examinationName: targetExam.name });
    } catch (err) {
      console.warn("Could not check marks dependencies:", err.message);
    }

    const hasDependencies = schedules.length > 0 || marks.length > 0;

    return {
      exam: targetExam,
      schedulesCount: schedules.length,
      marksCount: marks.length,
      hasDependencies,
    };
  },

  async deleteExamination(examIdOrName, cascade = false) {
    const deps = await this.checkExaminationDependencies(examIdOrName);
    const targetExam = deps.exam;

    if (!cascade && deps.hasDependencies) {
      const details = [];
      if (deps.schedulesCount > 0) details.push(`${deps.schedulesCount} timetable schedule item(s)`);
      if (deps.marksCount > 0) details.push(`${deps.marksCount} student mark record(s)`);
      throw new Error(
        `Examination "${targetExam.name}" has related data (${details.join(", ")}). Confirmation required to delete.`
      );
    }

    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Examinations");
        const remaining = rows.filter(
          (e) => e.id !== targetExam.id && e.name?.toLowerCase() !== targetExam.name.toLowerCase()
        );
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Examinations", remaining);
        invalidateWorksheetCache("Examinations");

        if (cascade) {
          // Remove linked schedules
          if (deps.schedulesCount > 0) {
            const schedRows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "ExaminationSchedule");
            const remainingSched = schedRows.filter(
              (s) => s.examinationName?.toLowerCase() !== targetExam.name.toLowerCase()
            );
            await setWorksheetData(process.env.GOOGLE_SHEET_ID, "ExaminationSchedule", remainingSched);
            invalidateWorksheetCache("ExaminationSchedule");
          }

          // Remove linked marks
          if (deps.marksCount > 0) {
            const marksRows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Marks");
            const remainingMarks = marksRows.filter(
              (m) => m.examinationName?.toLowerCase() !== targetExam.name.toLowerCase()
            );
            await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Marks", remainingMarks);
            invalidateWorksheetCache("Marks");
          }
        }
      } catch (err) {
        console.error("Google Sheets deleteExamination failed:", err.message);
        throw err;
      }
    }

    const db = await readLocalDatabase();
    db.examinations = (db.examinations || []).filter(
      (e) => e.id !== targetExam.id && e.name?.toLowerCase() !== targetExam.name.toLowerCase()
    );
    if (cascade) {
      db.examinationSchedule = (db.examinationSchedule || []).filter(
        (s) => s.examinationName?.toLowerCase() !== targetExam.name.toLowerCase()
      );
      db.marks = (db.marks || []).filter(
        (m) => m.examinationName?.toLowerCase() !== targetExam.name.toLowerCase()
      );
    }
    await writeLocalDatabase(db);

    return {
      success: true,
      deletedExam: targetExam.name,
      cascade,
      dependencies: deps,
    };
  },

  async getExaminationSchedule(examinationName, session, className) {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "ExaminationSchedule");
        if (rows && rows.length > 0) {
          let list = rows.map((s) => ({
            ...s,
            maxMarks: Number(s.maxMarks) || 100,
            passMarks: Number(s.passMarks) || 33,
          }));
          if (examinationName) list = list.filter((s) => s.examinationName === examinationName);
          if (session) list = list.filter((s) => s.academicSession === session);
          if (className) list = list.filter((s) => s.className === className);
          return list;
        }
      } catch (err) {
        console.warn("Google Sheets ExaminationSchedule read failed, using fallback:", err.message);
      }
    }

    const db = await readLocalDatabase();
    let list = db.examinationSchedule || [];
    if (examinationName) list = list.filter((s) => s.examinationName === examinationName);
    if (session) list = list.filter((s) => s.academicSession === session);
    if (className) list = list.filter((s) => s.className === className);
    return list;
  },

  async saveExaminationScheduleItem(scheduleItem) {
    const item = {
      id: scheduleItem.id || `sch-${Date.now()}`,
      ...scheduleItem,
      maxMarks: Number(scheduleItem.maxMarks) || 100,
      passMarks: Number(scheduleItem.passMarks) || 33,
    };

    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "ExaminationSchedule");
        const idx = rows.findIndex((s) => s.id === item.id);
        if (idx >= 0) {
          rows[idx] = item;
        } else {
          rows.push(item);
        }
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "ExaminationSchedule", rows);
        invalidateWorksheetCache("ExaminationSchedule");
      } catch (err) {
        console.error("Google Sheets saveExaminationScheduleItem failed:", err.message);
      }
    }

    const db = await readLocalDatabase();
    const idx = db.examinationSchedule.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      db.examinationSchedule[idx] = item;
    } else {
      db.examinationSchedule.push(item);
    }
    await writeLocalDatabase(db);
    return item;
  },

  async deleteExaminationScheduleItem(scheduleId) {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "ExaminationSchedule");
        const remaining = rows.filter((s) => s.id !== scheduleId);
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "ExaminationSchedule", remaining);
        invalidateWorksheetCache("ExaminationSchedule");
      } catch (err) {
        console.error("Google Sheets deleteExaminationScheduleItem failed:", err.message);
        throw err;
      }
    }

    const db = await readLocalDatabase();
    db.examinationSchedule = (db.examinationSchedule || []).filter((s) => s.id !== scheduleId);
    await writeLocalDatabase(db);

    return { success: true, id: scheduleId };
  },

  /**
   * Marks Management
   */
  async getMarks(filters = {}) {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Marks");
        if (rows && rows.length > 0) {
          return this._filterMarks(rows, filters);
        }
      } catch (err) {
        console.warn("Google Sheets Marks read failed, falling back to local:", err.message);
      }
    }

    const db = await readLocalDatabase();
    return this._filterMarks(db.marks || [], filters);
  },

  _filterMarks(records, filters) {
    let result = records.map((m) => {
      const isAbsent = parseBoolean(m.isAbsent);
      const graceMarks = Number(m.graceMarks) || 0;
      const isGrace = parseBoolean(m.isGrace) || graceMarks > 0;
      const marksObtained = isAbsent ? 0 : Number(m.marksObtained) || 0;
      return {
        ...m,
        isAbsent,
        isGrace,
        graceMarks,
        marksObtained,
        maxMarks: Number(m.maxMarks) || 100,
        passMarks: Number(m.passMarks) || 33,
      };
    });
    if (filters.admissionNumber) {
      result = result.filter((m) => m.admissionNumber === filters.admissionNumber);
    }
    if (filters.academicSession) {
      result = result.filter((m) => m.academicSession === filters.academicSession);
    }
    if (filters.examinationName) {
      result = result.filter((m) => m.examinationName === filters.examinationName);
    }
    if (filters.className) {
      result = result.filter((m) => m.className === filters.className);
    }
    return result;
  },

  async saveMarksBatch(marksPayload) {
    const { admissionNumber, academicSession, examinationName, className, section, subjects, teacherRemarks } = marksPayload;

    const savedRecords = subjects.map((sub) => {
      const maxMarks = Number(sub.maxMarks) || 100;
      const passMarks = Number(sub.passMarks) || 33;
      const isAbsent = parseBoolean(sub.isAbsent);
      const marksObtained = isAbsent ? 0 : Number(sub.marksObtained) || 0;
      const graceMarks = Number(sub.graceMarks) || 0;
      const isGrace = parseBoolean(sub.isGrace) || graceMarks > 0;
      const effectiveMarks = marksObtained + graceMarks;
      const percentage = maxMarks > 0 ? (effectiveMarks / maxMarks) * 100 : 0;
      const { grade } = calculateGrade(percentage);

      return {
        id: `mrk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        admissionNumber,
        academicSession,
        examinationName,
        className,
        section,
        subject: sub.subject,
        maxMarks,
        passMarks,
        marksObtained,
        graceMarks,
        isGrace: Boolean(isGrace),
        isAbsent: Boolean(isAbsent),
        grade: isAbsent ? "AB" : grade,
        remarks: sub.remarks || (graceMarks > 0 ? `Passed with ${graceMarks} Grace Marks` : teacherRemarks || ""),
        recordedAt: new Date().toISOString(),
      };
    });

    if (isGoogleSheetsConfigured()) {
      try {
        const liveMarks = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Marks");
        const filteredMarks = liveMarks.filter(
          (m) =>
            !(
              m.admissionNumber === admissionNumber &&
              m.academicSession === academicSession &&
              m.examinationName === examinationName
            )
        );
        const combined = [...filteredMarks, ...savedRecords];
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Marks", combined);
        invalidateWorksheetCache("Marks");
      } catch (err) {
        console.error("Google Sheets Marks write failed:", err.message);
      }
    }

    try {
      const db = await readLocalDatabase();
      db.marks = db.marks.filter(
        (m) =>
          !(
            m.admissionNumber === admissionNumber &&
            m.academicSession === academicSession &&
            m.examinationName === examinationName
          )
      );
      savedRecords.forEach((r) => db.marks.push(r));
      await writeLocalDatabase(db);
    } catch {}

    return savedRecords;
  },

  /**
   * Fee Management
   */
  async getFeeStructures(session, className) {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "FeeStructure");
        if (rows && rows.length > 0) {
          let list = rows.map((f) => ({
            ...f,
            amount: Number(f.amount) || 0,
          }));
          if (session) list = list.filter((f) => f.academicSession === session);
          if (className) list = list.filter((f) => f.className === className);
          return list;
        } else {
          const initialFee = getInitialDatabase().feeStructure || [];
          if (initialFee.length > 0) {
            await setWorksheetData(process.env.GOOGLE_SHEET_ID, "FeeStructure", initialFee);
          }
          let list = initialFee;
          if (session) list = list.filter((f) => f.academicSession === session);
          if (className) list = list.filter((f) => f.className === className);
          return list;
        }
      } catch (err) {
        console.warn("Google Sheets FeeStructure read failed, using fallback:", err.message);
      }
    }

    const db = await readLocalDatabase();
    let list = db.feeStructure || [];
    if (session) list = list.filter((f) => f.academicSession === session);
    if (className) list = list.filter((f) => f.className === className);
    return list;
  },

  async saveFeeStructure(item) {
    const newStructure = {
      id: item.id || `fs-${Date.now()}`,
      ...item,
      amount: Number(item.amount) || 0,
    };

    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "FeeStructure");
        const idx = rows.findIndex((f) => f.id === newStructure.id);
        if (idx >= 0) {
          rows[idx] = newStructure;
        } else {
          rows.push(newStructure);
        }
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "FeeStructure", rows);
        invalidateWorksheetCache("FeeStructure");
      } catch (err) {
        console.error("Google Sheets saveFeeStructure failed:", err.message);
      }
    }

    const db = await readLocalDatabase();
    const idx = db.feeStructure.findIndex((f) => f.id === newStructure.id);
    if (idx >= 0) {
      db.feeStructure[idx] = newStructure;
    } else {
      db.feeStructure.push(newStructure);
    }
    await writeLocalDatabase(db);
    return newStructure;
  },

  async getFeePayments(filters = {}) {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "FeePayments");
        if (rows && rows.length > 0) {
          return this._filterPayments(rows, filters);
        }
      } catch (err) {
        console.warn("Google Sheets FeePayments read failed, falling back to local:", err.message);
      }
    }

    const db = await readLocalDatabase();
    return this._filterPayments(db.feePayments || [], filters);
  },

  _filterPayments(payments, filters) {
    let result = [...payments];
    if (filters.admissionNumber) {
      result = result.filter((p) => p.admissionNumber === filters.admissionNumber);
    }
    if (filters.academicSession) {
      result = result.filter((p) => p.academicSession === filters.academicSession);
    }
    if (filters.className) {
      result = result.filter((p) => p.className === filters.className);
    }
    if (filters.receiptNumber) {
      result = result.filter((p) => p.receiptNumber === filters.receiptNumber);
    }

    // Sort newest payments first
    result.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    return result;
  },

  async recordFeePayment(paymentData) {
    const db = await readLocalDatabase();
    const count = db.feePayments.length + 1;
    const year = new Date().getFullYear();
    const receiptNumber = generateReceiptNumber(count, year);
    const discountAmount = Number(paymentData.discountAmount) || 0;
    const discountReason = paymentData.discountReason || "";

    const record = {
      receiptNumber,
      admissionNumber: paymentData.admissionNumber,
      studentName: paymentData.studentName,
      academicSession: paymentData.academicSession,
      className: paymentData.className,
      feeCategory: paymentData.feeCategory,
      amountPaid: Number(paymentData.amountPaid) || 0,
      discountAmount,
      discountReason,
      paymentMode: paymentData.paymentMode,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0],
      transactionRef: paymentData.transactionRef || "",
      receivedBy: paymentData.receivedBy || "Cashier",
      remarks: paymentData.remarks || "",
      createdAt: new Date().toISOString(),
    };

    db.feePayments.push(record);
    db.auditLog.push({
      id: `aud-${Date.now()}`,
      action: "FEE_PAYMENT",
      entity: "FeeReceipt",
      entityId: receiptNumber,
      details: `Collected ${record.amountPaid}${discountAmount > 0 ? ` (with ${discountAmount} discount: ${discountReason})` : ""} for ${record.studentName} (${record.feeCategory})`,
      performedBy: record.receivedBy,
      timestamp: new Date().toISOString(),
    });

    await writeLocalDatabase(db);

    if (isGoogleSheetsConfigured()) {
      try {
        await appendWorksheetRow(process.env.GOOGLE_SHEET_ID, "FeePayments", record);
      } catch (err) {
        console.error("Google Sheets FeePayments write failed:", err.message);
      }
    }

    return record;
  },

  /**
   * Pending Fee Calculation
   * Pending = Total Fee Structure - Total Payments - Concessions/Discounts
   */
  async getStudentFeeSummary(admissionNumber, session) {
    const student = await this.getStudentByAdmissionNumber(admissionNumber);
    if (!student) throw new Error(`Student ${admissionNumber} not found`);

    const activeSession = session || student.academicSession || appConfig.defaultSession;
    const structures = await this.getFeeStructures(activeSession, student.className);
    const payments = await this.getFeePayments({ admissionNumber, academicSession: activeSession });

    const totalApplicable = structures.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const totalDiscount = payments.reduce((sum, p) => sum + (Number(p.discountAmount) || 0), 0);
    const totalCredited = totalPaid + totalDiscount;
    const balance = Math.max(0, totalApplicable - totalCredited);

    return {
      student,
      academicSession: activeSession,
      totalApplicable,
      totalPaid,
      totalDiscount,
      totalCredited,
      outstandingBalance: balance,
      structures,
      payments,
      isFullyPaid: balance === 0,
    };
  },

  /**
   * High performance Batch Fee Summaries
   * Fetches students, structures, and payments in single queries and calculates dues in-memory.
   * Completely avoids N+1 queries.
   */
  async getBatchStudentFeeSummaries(session, className) {
    const activeSession = session || appConfig.defaultSession;
    const students = await this.getStudents({
      session: activeSession,
      className,
      status: "Active",
    });

    const allStructures = await this.getFeeStructures(activeSession);
    const allPayments = await this.getFeePayments({ academicSession: activeSession });

    // Group fee structures by class
    const structuresByClass = {};
    allStructures.forEach((s) => {
      const cls = s.className || "All";
      if (!structuresByClass[cls]) structuresByClass[cls] = [];
      structuresByClass[cls].push(s);
    });

    // Group payments by student admission number
    const paymentsByStudent = {};
    allPayments.forEach((p) => {
      if (!paymentsByStudent[p.admissionNumber]) paymentsByStudent[p.admissionNumber] = [];
      paymentsByStudent[p.admissionNumber].push(p);
    });

    return students.map((student) => {
      const classStructures = structuresByClass[student.className] || structuresByClass["All"] || [];
      const studentPayments = paymentsByStudent[student.admissionNumber] || [];

      const totalApplicable = classStructures.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
      const totalDiscount = studentPayments.reduce((sum, p) => sum + (Number(p.discountAmount) || 0), 0);
      const totalCredited = totalPaid + totalDiscount;
      const balance = Math.max(0, totalApplicable - totalCredited);

      return {
        student,
        academicSession: activeSession,
        totalApplicable,
        totalPaid,
        totalDiscount,
        totalCredited,
        outstandingBalance: balance,
        structures: classStructures,
        payments: studentPayments,
        isFullyPaid: balance === 0,
      };
    });
  },

  /**
   * Settings (School Name, Address, Contact, Affiliation)
   * Synced directly with Google Sheets 'Settings' tab when connected
   */
  async getSettings() {
    if (isGoogleSheetsConfigured()) {
      try {
        const rows = await getWorksheetData(process.env.GOOGLE_SHEET_ID, "Settings");
        if (rows && rows.length > 0) {
          const settingsObj = { ...appConfig.school };
          rows.forEach((r) => {
            if (r.key && r.value !== undefined) {
              settingsObj[r.key] = r.value;
            }
          });
          return settingsObj;
        } else {
          // Initialize Google Sheets Settings tab with current school defaults
          const initialRows = Object.entries(appConfig.school).map(([key, value]) => ({
            key,
            value: String(value || ""),
            updatedAt: new Date().toISOString(),
          }));
          await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Settings", initialRows);
          return appConfig.school;
        }
      } catch (err) {
        console.warn("Could not read Settings from Google Sheets, using fallback:", err.message);
      }
    }

    const db = await readLocalDatabase();
    return db.settings || appConfig.school;
  },

  async updateSettings(newSettings) {
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };

    if (isGoogleSheetsConfigured()) {
      try {
        const rows = Object.entries(updated).map(([key, value]) => ({
          key,
          value: String(value || ""),
          updatedAt: new Date().toISOString(),
        }));
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Settings", rows);
      } catch (err) {
        console.error("Failed to save Settings to Google Sheets:", err.message);
      }
    }

    const db = await readLocalDatabase();
    db.settings = updated;
    await writeLocalDatabase(db);
    return updated;
  },

  // ----------------------------------------------------
  // User & Permission Management Methods
  // ----------------------------------------------------
  async getUsers() {
    const db = await readLocalDatabase();
    if (!db.users || !Array.isArray(db.users) || db.users.length === 0) {
      db.users = [...DEFAULT_USERS];
      await writeLocalDatabase(db);
    }
    return db.users;
  },

  async getUserById(id) {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  async createUser(userData) {
    const db = await readLocalDatabase();
    if (!db.users) db.users = [...DEFAULT_USERS];

    const newUser = {
      id: userData.id || `usr-${Date.now().toString(36)}`,
      name: userData.name?.trim() || "Staff Member",
      username: userData.username?.trim().toLowerCase() || userData.email?.split("@")[0] || `staff_${Date.now().toString(36)}`,
      email: userData.email?.trim().toLowerCase() || "",
      password: userData.password?.trim() || "staff123",
      role: userData.role?.trim() || "Staff",
      permissions: Array.isArray(userData.permissions) ? userData.permissions : [],
      status: userData.status || "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    if (db.auditLog) {
      db.auditLog.push({
        id: `aud-${Date.now()}`,
        action: "CREATE_USER",
        entity: "User",
        entityId: newUser.id,
        details: `Created user ${newUser.name} with role ${newUser.role}`,
        performedBy: "Staff",
        timestamp: new Date().toISOString(),
      });
    }
    await writeLocalDatabase(db);
    return newUser;
  },

  async authenticateUser(identifier, password) {
    if (!identifier || !password) return null;
    const users = await this.getUsers();
    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const user = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.id && u.id.toLowerCase() === cleanId) ||
        (u.id === "usr-admin" && (cleanId === "admin@oxfordacademy.edu.in" || cleanId === "principal@oxfordacademy.edu.in" || cleanId === "admin"))
    );

    if (!user) return null;
    if (user.password && user.password !== cleanPass) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
    };
  },

  async updateUser(id, userData) {
    const db = await readLocalDatabase();
    if (!db.users) db.users = [...DEFAULT_USERS];

    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updated = {
      ...db.users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    db.users[index] = updated;
    if (db.auditLog) {
      db.auditLog.push({
        id: `aud-${Date.now()}`,
        action: "UPDATE_USER",
        entity: "User",
        entityId: id,
        details: `Updated user ${updated.name} (${updated.role})`,
        performedBy: "Staff",
        timestamp: new Date().toISOString(),
      });
    }
    await writeLocalDatabase(db);
    return updated;
  },

  async deleteUser(id) {
    if (id === "usr-admin") {
      throw new Error("Cannot delete primary Super Admin account");
    }
    const db = await readLocalDatabase();
    if (!db.users) return false;

    const initialLen = db.users.length;
    db.users = db.users.filter((u) => u.id !== id);
    if (db.users.length !== initialLen) {
      if (db.auditLog) {
        db.auditLog.push({
          id: `aud-${Date.now()}`,
          action: "DELETE_USER",
          entity: "User",
          entityId: id,
          details: `Deleted user ${id}`,
          performedBy: "Staff",
          timestamp: new Date().toISOString(),
        });
      }
      await writeLocalDatabase(db);
      return true;
    }
    return false;
  },
};

export default storageService;
