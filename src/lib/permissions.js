/**
 * Role-Based Access Control (RBAC) & Granular Permission System
 */

export const PERMISSION_MODULES = [
  {
    id: "students",
    label: "Student Management",
    description: "Manage student enrollments, directories, and profiles",
    icon: "Users",
    permissions: [
      {
        id: "students.view",
        label: "View & Search Students",
        description: "Access student directory, search profiles, view class distribution & rosters",
      },
      {
        id: "students.manage",
        label: "Admit & Edit Students",
        description: "Create new admissions, edit student personal & academic details",
      },
    ],
  },
  {
    id: "fees",
    label: "Fee Management",
    description: "Handle collections, fee dues, discounts, and payment receipts",
    icon: "BadgeDollarSign",
    permissions: [
      {
        id: "fees.view",
        label: "View Fee Reports & Balances",
        description: "View fee collection totals, outstanding balances & defaulter lists",
      },
      {
        id: "fees.collect",
        label: "Record Payments & Discounts",
        description: "Collect student fees, issue official receipts & apply upfront discounts",
      },
      {
        id: "fees.manage",
        label: "Manage Fee Structures",
        description: "Define class-wise fee structures and installment amounts",
      },
    ],
  },
  {
    id: "academics",
    label: "Academics & Examinations",
    description: "Organize academic sessions, classes, subjects, marks, and marksheets",
    icon: "Award",
    permissions: [
      {
        id: "academics.view",
        label: "View Academic Setup",
        description: "View sessions, classes, sections, subjects & examination schedules",
      },
      {
        id: "academics.manage",
        label: "Manage Academic Setup",
        description: "Create and update academic sessions, classes, subjects & examinations",
      },
      {
        id: "marks.manage",
        label: "Enter & Evaluate Marks",
        description: "Record student subject marks, apply grace marks and determine pass/fail",
      },
      {
        id: "marksheets.view",
        label: "Generate & Print Marksheets",
        description: "Preview, download and print student progress reports and marksheets",
      },
    ],
  },
  {
    id: "documents",
    label: "Passes & School Documents",
    description: "Generate student identity cards, admit cards, and certificates",
    icon: "FileCheck",
    permissions: [
      {
        id: "documents.cards",
        label: "Generate ID & Admit Cards",
        description: "Print official student identity cards and exam admit cards",
      },
      {
        id: "documents.certificates",
        label: "Issue School Certificates",
        description: "Generate Transfer Certificates, Character Certificates & blank admission forms",
      },
    ],
  },
  {
    id: "system",
    label: "System & Administration",
    description: "System configurations, users, and data management",
    icon: "Settings",
    permissions: [
      {
        id: "system.users",
        label: "Manage Users & Permissions",
        description: "Create staff users, assign roles and configure permission checkboxes",
      },
      {
        id: "system.settings",
        label: "School Settings & Cloud Sync",
        description: "Configure school branding, logo, credentials & Google Sheets sync",
      },
      {
        id: "system.excel",
        label: "Excel Import & Export",
        description: "Export full database to Excel or bulk import student/fee spreadsheets",
      },
    ],
  },
];

export const ROLE_PRESETS = [
  {
    id: "admin",
    name: "Full Administrator",
    roleTitle: "Super Admin",
    description: "Unrestricted access to all school operations, financial records, and system settings.",
    permissions: ["*"],
  },
  {
    id: "sub_admin",
    name: "Vice Principal / Sub-Admin",
    roleTitle: "Vice Principal",
    description: "Manage students, classes, exams, marksheets, certificates, and view fee overviews.",
    permissions: [
      "students.view",
      "students.manage",
      "academics.view",
      "academics.manage",
      "marks.manage",
      "marksheets.view",
      "documents.cards",
      "documents.certificates",
      "fees.view",
    ],
  },
  {
    id: "accountant",
    name: "Accountant / Cashier",
    roleTitle: "Accountant",
    description: "Manage student fees, fee collection, discount approvals, receipts, and dues reports.",
    permissions: [
      "students.view",
      "fees.view",
      "fees.collect",
      "fees.manage",
      "documents.cards",
    ],
  },
  {
    id: "teacher",
    name: "Teacher / Academic Incharge",
    roleTitle: "Class Teacher",
    description: "Access student rosters, enter test marks, grace marks, and print marksheets & cards.",
    permissions: [
      "students.view",
      "academics.view",
      "marks.manage",
      "marksheets.view",
      "documents.cards",
    ],
  },
  {
    id: "clerk",
    name: "Front Desk / Admission Clerk",
    roleTitle: "Office Clerk",
    description: "Handle new student admissions, student searches, fee collection, and identity cards.",
    permissions: [
      "students.view",
      "students.manage",
      "fees.collect",
      "documents.cards",
      "documents.certificates",
    ],
  },
];

export const DEFAULT_USERS = [
  {
    id: "usr-admin",
    name: "Dr. Radhika Sen",
    username: "admin",
    email: "admin@oxfordacademy.edu.in",
    password: "admin123",
    role: "Super Admin",
    permissions: ["*"],
    status: "Active",
    createdAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "usr-acc",
    name: "Rajesh Sharma",
    username: "accountant",
    email: "accounts@oxfordacademy.edu.in",
    password: "acc123",
    role: "Accountant",
    permissions: ["students.view", "fees.view", "fees.collect", "fees.manage", "documents.cards"],
    status: "Active",
    createdAt: "2026-04-01T09:30:00.000Z",
  },
  {
    id: "usr-teacher",
    name: "Meenakshi Verma",
    username: "teacher",
    email: "teacher@oxfordacademy.edu.in",
    password: "teacher123",
    role: "Class Teacher",
    permissions: ["students.view", "academics.view", "marks.manage", "marksheets.view", "documents.cards"],
    status: "Active",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "usr-clerk",
    name: "Amit Patel",
    username: "clerk",
    email: "clerk@oxfordacademy.edu.in",
    password: "clerk123",
    role: "Office Clerk",
    permissions: ["students.view", "students.manage", "fees.collect", "documents.cards", "documents.certificates"],
    status: "Active",
    createdAt: "2026-04-01T10:30:00.000Z",
  },
];

/**
 * Check whether a user's permissions array grants access to a specific permission.
 */
export function hasPermission(userPermissions, requiredPermission) {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes("*") || userPermissions.includes("all")) return true;
  if (userPermissions.includes(requiredPermission)) return true;

  const prefix = requiredPermission.split(".")[0];
  if (userPermissions.includes(`${prefix}.*`)) return true;

  return false;
}

/**
 * Check whether a user's permissions array satisfies at least one permission in a list.
 */
export function hasAnyPermission(userPermissions, permissionList) {
  if (!permissionList || permissionList.length === 0) return true;
  return permissionList.some((perm) => hasPermission(userPermissions, perm));
}
