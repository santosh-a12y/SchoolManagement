import test from "node:test";
import assert from "node:assert/strict";
import { calculateGrade, amountToWords, formatCurrency } from "../src/lib/formatters.js";
import { generateAdmissionNumber, generateReceiptNumber } from "../src/lib/utils.js";
import { storageService } from "../src/services/storageService.js";

test("calculateGrade accurately evaluates grades, points, and passing status", () => {
  const outstanding = calculateGrade(95.5);
  assert.equal(outstanding.grade, "A1");
  assert.equal(outstanding.gradePoint, 10);
  assert.equal(outstanding.isPassed, true);

  const excellent = calculateGrade(85.0);
  assert.equal(excellent.grade, "A2");
  assert.equal(excellent.gradePoint, 9);
  assert.equal(excellent.isPassed, true);

  const veryGood = calculateGrade(74.0);
  assert.equal(veryGood.grade, "B1");
  assert.equal(veryGood.isPassed, true);

  const passBoundary = calculateGrade(33.0);
  assert.equal(passBoundary.grade, "D");
  assert.equal(passBoundary.isPassed, true);

  const fail = calculateGrade(32.5);
  assert.equal(fail.grade, "E");
  assert.equal(fail.isPassed, false);
});

test("amountToWords converts currency numbers to official English words", () => {
  assert.equal(amountToWords(12500), "Rupees Twelve Thousand Five Hundred Only");
  assert.equal(amountToWords(100000), "Rupees One Lakh Only");
  assert.equal(amountToWords(24000), "Rupees Twenty Four Thousand Only");
  assert.equal(amountToWords(0), "Rupees Zero Only");
});

test("Identifier generators produce correct padded formats", () => {
  assert.equal(generateAdmissionNumber(1, 2026), "ADM-2026-001");
  assert.equal(generateAdmissionNumber(42, 2026), "ADM-2026-042");
  assert.equal(generateReceiptNumber(5, 2026), "RCP-2026-0005");
  assert.equal(generateReceiptNumber(1024, 2026), "RCP-2026-1024");
});

test("Storage service: Student registration, duplicate prevention, marks, and fees", async () => {
  const testAdmNo = `TEST-ADM-${Date.now()}`;
  const testStudent = {
    admissionNumber: testAdmNo,
    studentName: "Test Student Alpha",
    dateOfBirth: "2015-05-10",
    gender: "Male",
    bloodGroup: "A+",
    residentialAddress: "Test Address 123",
    academicSession: "2026-27",
    className: "Class 5",
    section: "A",
    rollNumber: "99",
    admissionDate: "2026-04-01",
    status: "Active",
    fatherName: "Father Alpha",
    motherName: "Mother Alpha",
    parentContact: "+91 99999 88888",
  };

  // 1. Create student
  const created = await storageService.createStudent(testStudent);
  assert.equal(created.admissionNumber, testAdmNo);

  // 2. Retrieve student
  const retrieved = await storageService.getStudentByAdmissionNumber(testAdmNo);
  assert.ok(retrieved);
  assert.equal(retrieved.studentName, "Test Student Alpha");

  // 3. Reject duplicate admission number
  await assert.rejects(
    async () => {
      await storageService.createStudent(testStudent);
    },
    {
      message: /already exists/,
    }
  );

  // 4. Save marks batch
  const marksResult = await storageService.saveMarksBatch({
    admissionNumber: testAdmNo,
    academicSession: "2026-27",
    examinationName: "Annual Exam",
    className: "Class 5",
    section: "A",
    subjects: [
      { subject: "English", maxMarks: 100, passMarks: 33, marksObtained: 90, isAbsent: false },
      { subject: "Mathematics", maxMarks: 100, passMarks: 33, marksObtained: 95, isAbsent: false },
    ],
    teacherRemarks: "Exemplary student",
  });
  assert.equal(marksResult.length, 2);
  assert.equal(marksResult[0].grade, "A2");
  assert.equal(marksResult[1].grade, "A1");

  // 5. Fee calculation & payment
  const initialFeeSummary = await storageService.getStudentFeeSummary(testAdmNo, "2026-27");
  assert.ok(initialFeeSummary.totalApplicable > 0);
  const initialBalance = initialFeeSummary.outstandingBalance;

  // Record a payment of 5000
  const payment = await storageService.recordFeePayment({
    admissionNumber: testAdmNo,
    studentName: "Test Student Alpha",
    academicSession: "2026-27",
    className: "Class 5",
    feeCategory: "Tuition Fee",
    amountPaid: 5000,
    paymentMode: "UPI",
    receivedBy: "Staff",
  });
  assert.ok(payment.receiptNumber.startsWith("RCP-"));

  // Check new pending balance
  const updatedFeeSummary = await storageService.getStudentFeeSummary(testAdmNo, "2026-27");
  assert.equal(updatedFeeSummary.outstandingBalance, initialBalance - 5000);
});

test("getNextSchoolClass progression and grace marks evaluation", async () => {
  const { getNextSchoolClass } = await import("../src/lib/constants.js");

  // Progression checks
  assert.equal(getNextSchoolClass("Nursery"), "LKG");
  assert.equal(getNextSchoolClass("LKG"), "UKG");
  assert.equal(getNextSchoolClass("UKG"), "Class 1");
  assert.equal(getNextSchoolClass("Class 5"), "Class 6");
  assert.equal(getNextSchoolClass("Class 9"), "Class 10");
  assert.equal(getNextSchoolClass("Class 10"), "Class 11");
  assert.equal(getNextSchoolClass("Class 11"), "Class 12");
  assert.equal(getNextSchoolClass("Class 12"), "Graduated (Course Complete)");
  assert.equal(getNextSchoolClass("Unknown Class"), null);

  // Storage verification with Grace Marks
  const graceTestAdmNo = `GRACE-ADM-${Date.now()}`;
  await storageService.createStudent({
    admissionNumber: graceTestAdmNo,
    studentName: "Grace Test Student",
    dateOfBirth: "2014-03-12",
    gender: "Female",
    residentialAddress: "Address",
    academicSession: "2026-27",
    className: "Class 7",
    section: "B",
    rollNumber: "15",
    admissionDate: "2026-04-01",
    status: "Active",
    fatherName: "Father",
    motherName: "Mother",
    parentContact: "+91 99999 77777",
  });

  // Student scored 28 in Math (Pass marks is 33). Award 5 grace marks.
  const marksSaved = await storageService.saveMarksBatch({
    admissionNumber: graceTestAdmNo,
    academicSession: "2026-27",
    examinationName: "Annual Examination",
    className: "Class 7",
    section: "B",
    subjects: [
      {
        subject: "Mathematics",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 28,
        graceMarks: 5,
        isGrace: true,
        isAbsent: false,
      },
      {
        subject: "Science",
        maxMarks: 100,
        passMarks: 33,
        marksObtained: 75,
        graceMarks: 0,
        isGrace: false,
        isAbsent: false,
      },
    ],
    teacherRemarks: "Promoted with grace",
  });

  assert.equal(marksSaved.length, 2);
  const mathRecord = marksSaved.find((m) => m.subject === "Mathematics");
  assert.equal(mathRecord.marksObtained, 28);
  assert.equal(mathRecord.graceMarks, 5);
  assert.equal(mathRecord.isGrace, true);
  // 28 + 5 = 33% -> Grade D (Passed)
  assert.equal(mathRecord.grade, "D");
});
