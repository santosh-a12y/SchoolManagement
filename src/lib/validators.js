import { z } from "zod";

/**
 * Lightweight, zero-dependency resolver for React Hook Form with Zod schemas.
 * Avoids external resolver peer-dependency conflicts.
 */
export function createZodResolver(schema) {
  return async (data) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors = {};
    result.error.errors.forEach((err) => {
      const field = err.path.join(".");
      if (!errors[field]) {
        errors[field] = { type: err.code, message: err.message };
      }
    });
    return { values: {}, errors };
  };
}

/**
 * Student Registration & Edit Validation Schema
 */
export const studentSchema = z.object({
  admissionNumber: z
    .string()
    .min(3, "Admission number is required (min 3 characters)")
    .trim(),
  studentName: z
    .string()
    .min(2, "Student full name is required (min 2 characters)")
    .trim(),
  dateOfBirth: z
    .string()
    .min(10, "Valid Date of Birth is required (YYYY-MM-DD)"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Select a valid gender" }),
  }),
  bloodGroup: z.string().optional(),
  studentPhoto: z.string().optional(),
  contactNumber: z
    .string()
    .regex(/^[0-9+\s-]{7,15}$/, "Valid contact number required")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  residentialAddress: z
    .string()
    .min(5, "Residential address is required (min 5 characters)"),
  academicSession: z.string().min(4, "Academic session is required"),
  className: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  rollNumber: z.string().min(1, "Roll number is required").trim(),
  admissionDate: z.string().min(10, "Admission date is required"),
  status: z.enum(["Active", "Inactive", "Transferred", "Graduated"]).default("Active"),
  // Parent & Guardian Details
  fatherName: z.string().min(2, "Father's name is required").trim(),
  fatherPhoto: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().min(2, "Mother's name is required").trim(),
  motherPhoto: z.string().optional(),
  motherOccupation: z.string().optional(),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  parentContact: z
    .string()
    .min(7, "Primary parent contact number is required")
    .regex(/^[0-9+\s-]{7,15}$/, "Enter a valid phone number"),
  parentEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  emergencyContact: z.string().optional(),
});

/**
 * Fee Payment Recording Schema
 */
export const feePaymentSchema = z.object({
  admissionNumber: z.string().min(1, "Admission number is required"),
  studentName: z.string().min(1, "Student name is required"),
  academicSession: z.string().min(1, "Academic session is required"),
  className: z.string().min(1, "Class is required"),
  feeCategory: z.string().min(1, "Select fee category"),
  amountPaid: z
    .number({ invalid_type_error: "Enter valid payment amount" })
    .positive("Amount must be greater than zero"),
  paymentMode: z.enum(["Cash", "UPI", "Bank Transfer", "Cheque", "Demand Draft"]),
  paymentDate: z.string().min(10, "Payment date is required"),
  transactionRef: z.string().optional(),
  receivedBy: z.string().min(2, "Staff name is required"),
  remarks: z.string().optional(),
});

/**
 * Marks Entry Schema
 */
export const marksRecordSchema = z.object({
  admissionNumber: z.string().min(1, "Admission number is required"),
  academicSession: z.string().min(1, "Academic session is required"),
  examinationName: z.string().min(1, "Examination name is required"),
  className: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  subjects: z.array(
    z.object({
      subject: z.string().min(1),
      maxMarks: z.number().positive(),
      passMarks: z.number().positive(),
      marksObtained: z.number().min(0),
      isAbsent: z.boolean().default(false),
      remarks: z.string().optional(),
    })
  ).min(1, "At least one subject mark is required"),
  teacherRemarks: z.string().optional(),
});
