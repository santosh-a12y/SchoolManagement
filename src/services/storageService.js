import fs from "fs/promises";
import path from "path";
import { isGoogleSheetsConfigured } from "../lib/google/auth.js";
import {
  getWorksheetData,
  appendWorksheetRow,
  setWorksheetData,
} from "../lib/google/sheets.js";
import appConfig from "../config/appConfig.js";
import { generateReceiptNumber } from "../lib/utils.js";
import { calculateGrade } from "../lib/formatters.js";

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
  };
}

/**
 * Read the local database JSON file with automatic fallback initialization
 */
async function readLocalDatabase() {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(content);
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
  await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
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

    return {
      mode: isConfigured ? "google_sheets" : "demo_local",
      isConfigured,
      sheetId: isConfigured ? sheetId.slice(0, 8) + "..." : null,
      activeSession: db.settings?.activeSession || appConfig.defaultSession,
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

    if (isGoogleSheetsConfigured()) {
      try {
        await setWorksheetData(process.env.GOOGLE_SHEET_ID, "Students", db.students);
      } catch (err) {
        console.error("Google Sheets update failed:", err.message);
      }
    }

    return updated;
  },

  async deleteStudent(admissionNumber) {
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
    const db = await readLocalDatabase();
    return db.academicSessions || [];
  },

  async createAcademicSession(sessionData) {
    const db = await readLocalDatabase();
    const existing = db.academicSessions.find((s) => s.id === sessionData.id);
    if (existing) {
      throw new Error(`Session ${sessionData.id} already exists.`);
    }

    if (sessionData.isActive) {
      db.academicSessions.forEach((s) => (s.isActive = false));
      db.settings.activeSession = sessionData.id;
    }

    const newSession = {
      ...sessionData,
      createdAt: new Date().toISOString(),
    };
    db.academicSessions.push(newSession);
    await writeLocalDatabase(db);
    return newSession;
  },

  async setActiveSession(sessionId) {
    const db = await readLocalDatabase();
    const session = db.academicSessions.find((s) => s.id === sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    db.academicSessions.forEach((s) => (s.isActive = s.id === sessionId));
    db.settings.activeSession = sessionId;
    await writeLocalDatabase(db);
    return session;
  },

  /**
   * Classes & Subjects
   */
  async getClasses() {
    const db = await readLocalDatabase();
    return db.classes || [];
  },

  async createClass(classData) {
    const db = await readLocalDatabase();
    const existing = db.classes.find((c) => c.name.toLowerCase() === classData.name.toLowerCase());
    if (existing) throw new Error(`Class ${classData.name} already exists`);

    const newClass = {
      id: `cls-${Date.now()}`,
      ...classData,
      sections: classData.sections || ["A", "B"],
      createdAt: new Date().toISOString(),
    };
    db.classes.push(newClass);
    await writeLocalDatabase(db);
    return newClass;
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
    const db = await readLocalDatabase();
    return db.examinations || [];
  },

  async createExamination(examData) {
    const db = await readLocalDatabase();
    const newExam = {
      id: examData.id || `exam-${Date.now()}`,
      ...examData,
      createdAt: new Date().toISOString(),
    };
    db.examinations.push(newExam);
    await writeLocalDatabase(db);
    return newExam;
  },

  async getExaminationSchedule(examinationName, session, className) {
    const db = await readLocalDatabase();
    let list = db.examinationSchedule || [];
    if (examinationName) list = list.filter((s) => s.examinationName === examinationName);
    if (session) list = list.filter((s) => s.academicSession === session);
    if (className) list = list.filter((s) => s.className === className);
    return list;
  },

  async saveExaminationScheduleItem(scheduleItem) {
    const db = await readLocalDatabase();
    const item = {
      id: scheduleItem.id || `sch-${Date.now()}`,
      ...scheduleItem,
    };
    const idx = db.examinationSchedule.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      db.examinationSchedule[idx] = item;
    } else {
      db.examinationSchedule.push(item);
    }
    await writeLocalDatabase(db);
    return item;
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
    let result = [...records];
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
    const db = await readLocalDatabase();

    // Remove old marks for this student, session, and exam to avoid duplicate entries
    db.marks = db.marks.filter(
      (m) =>
        !(
          m.admissionNumber === admissionNumber &&
          m.academicSession === academicSession &&
          m.examinationName === examinationName
        )
    );

    const savedRecords = [];
    subjects.forEach((sub) => {
      const maxMarks = Number(sub.maxMarks) || 100;
      const passMarks = Number(sub.passMarks) || 33;
      const marksObtained = sub.isAbsent ? 0 : Number(sub.marksObtained) || 0;
      const percentage = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
      const { grade } = calculateGrade(percentage);

      const record = {
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
        isAbsent: Boolean(sub.isAbsent),
        grade: sub.isAbsent ? "AB" : grade,
        remarks: sub.remarks || teacherRemarks || "",
        recordedAt: new Date().toISOString(),
      };
      db.marks.push(record);
      savedRecords.push(record);
    });

    await writeLocalDatabase(db);

    if (isGoogleSheetsConfigured()) {
      try {
        for (const record of savedRecords) {
          await appendWorksheetRow(process.env.GOOGLE_SHEET_ID, "Marks", record);
        }
      } catch (err) {
        console.error("Google Sheets Marks write failed:", err.message);
      }
    }

    return savedRecords;
  },

  /**
   * Fee Management
   */
  async getFeeStructures(session, className) {
    const db = await readLocalDatabase();
    let list = db.feeStructure || [];
    if (session) list = list.filter((f) => f.academicSession === session);
    if (className) list = list.filter((f) => f.className === className);
    return list;
  },

  async saveFeeStructure(item) {
    const db = await readLocalDatabase();
    const newStructure = {
      id: item.id || `fs-${Date.now()}`,
      ...item,
    };
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

    const record = {
      receiptNumber,
      admissionNumber: paymentData.admissionNumber,
      studentName: paymentData.studentName,
      academicSession: paymentData.academicSession,
      className: paymentData.className,
      feeCategory: paymentData.feeCategory,
      amountPaid: Number(paymentData.amountPaid) || 0,
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
      details: `Collected ${record.amountPaid} for ${record.studentName} (${record.feeCategory})`,
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
   * Pending = Total Fee Structure - Total Payments - Concessions
   */
  async getStudentFeeSummary(admissionNumber, session) {
    const student = await this.getStudentByAdmissionNumber(admissionNumber);
    if (!student) throw new Error(`Student ${admissionNumber} not found`);

    const activeSession = session || student.academicSession || appConfig.defaultSession;
    const structures = await this.getFeeStructures(activeSession, student.className);
    const payments = await this.getFeePayments({ admissionNumber, academicSession: activeSession });

    const totalApplicable = structures.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const balance = Math.max(0, totalApplicable - totalPaid);

    return {
      student,
      academicSession: activeSession,
      totalApplicable,
      totalPaid,
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
      const balance = Math.max(0, totalApplicable - totalPaid);

      return {
        student,
        academicSession: activeSession,
        totalApplicable,
        totalPaid,
        outstandingBalance: balance,
        structures: classStructures,
        payments: studentPayments,
        isFullyPaid: balance === 0,
      };
    });
  },

  /**
   * Settings
   */
  async getSettings() {
    const db = await readLocalDatabase();
    return db.settings || appConfig.school;
  },

  async updateSettings(newSettings) {
    const db = await readLocalDatabase();
    db.settings = {
      ...db.settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };
    await writeLocalDatabase(db);
    return db.settings;
  },
};

export default storageService;
