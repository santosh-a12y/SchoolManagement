# Student Management System — Next.js (App Router)

A complete, functional, and maintainable **Student Management System** built with **Next.js (App Router)**, **JavaScript (JSX)**, **Tailwind CSS**, and **Google Sheets API** (with zero-config offline persistent fallback).

Designed for school administrators and office staff, featuring a responsive admin dashboard, student admission workflows, examination & marksheet generator, standard & vertical physical student ID cards, examination admit cards, fee management with receipt generation, provisional certificates, and Excel import/export.

---

## 1. Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, JavaScript JSX — no TypeScript).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom administrative design tokens and dedicated `@media print` rules.
- **Icons**: [Lucide React](https://lucide.dev/).
- **Primary Data Store**:
  - **Cloud Mode**: Google Sheets API v4 (Service Account server-side integration across 14 worksheets).
  - **Local Demo Mode**: Server-side persistent storage (`data/school_database.json`) seeded with realistic students, classes, exams, marks, and fees.
- **Photo Storage**: Google Drive API (with automatic local file fallback to `public/uploads/`).
- **Spreadsheet Processing**: [SheetJS (xlsx)](https://docs.sheetjs.com/) for bulk Excel imports, validation, and exports.
- **Document Generation**: High-fidelity HTML templates with browser native `@media print` and client-side PDF downloads via [html2canvas](https://html2canvas.hertzen.com/) & [jsPDF](https://parall.ax/products/jspdf).
- **Form Handling & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/).

---

## 2. Directory Structure

```text
student-management-system/
├── public/
│   ├── images/
│   └── uploads/                  # Uploaded student & parent photos (local fallback)
├── data/
│   └── school_database.json      # Server-side persistent database (Demo/Offline)
├── src/
│   ├── app/
│   │   ├── layout.js             # Root HTML layout with school metadata
│   │   ├── page.js               # Root redirect to /dashboard
│   │   ├── globals.css           # Design tokens, custom scrollbars & @media print rules
│   │   ├── loading.js            # Global loading fallback spinner
│   │   ├── error.js              # Error boundary
│   │   ├── not-found.js          # 404 handler
│   │   ├── dashboard/page.js     # Real-time metrics, analytics & action hub
│   │   ├── students/
│   │   │   ├── page.js           # Student directory table with search & filters
│   │   │   ├── new/page.js       # New admission registration form
│   │   │   ├── search/page.js    # Dedicated instant student lookup
│   │   │   └── [admissionNumber]/page.js # Comprehensive student profile & tabs
│   │   ├── academics/
│   │   │   ├── sessions/page.js  # Academic year calendar & active session switch
│   │   │   ├── classes/page.js   # Class levels & section management
│   │   │   └── examinations/page.js # Exam terms & timetable schedules
│   │   ├── marksheets/page.js    # Subject marks entry & printable marksheet report
│   │   ├── id-cards/page.js      # Standard CR-80 (horizontal) & Vertical portrait ID cards
│   │   ├── admit-cards/page.js   # Examination hall ticket generator with schedules
│   │   ├── fees/
│   │   │   ├── page.js           # Fee structure overview by class & session
│   │   │   ├── payments/page.js  # Fee payment entry & receipt generation
│   │   │   ├── pending/page.js   # Class-wide and student-wide pending fee reports
│   │   │   └── receipts/page.js  # Official receipt viewer and reprint archive
│   │   ├── documents/
│   │   │   ├── admission-form/page.js # Official printable admission form with photos
│   │   │   └── certificates/page.js   # Provisional school leaving & character certificates
│   │   ├── excel/page.js         # Bulk Excel import with validation & export center
│   │   ├── settings/page.js      # Institution profile & Google Sheets cloud sync
│   │   └── api/                  # 13 server-side API route handlers
│   ├── components/
│   │   ├── layout/               # AppLayout, AppSidebar, AppHeader, PageHeader
│   │   ├── ui/                   # Button, Input, Select, SearchableSelect, Modal, DataTable, Badge, EmptyState
│   │   └── students/             # StudentForm (React Hook Form + Zod)
│   ├── lib/
│   │   ├── constants.js          # Classes, sessions, grading scales, fee categories
│   │   ├── formatters.js         # Currency, dates, percentage, amountToWords, calculateGrade
│   │   ├── utils.js              # ID generators, downloadBlob, class concatenation
│   │   ├── validators.js         # Zod validation schemas & custom resolver
│   │   └── google/               # Google Auth, Sheets API, Drive API wrappers
│   ├── services/                 # studentService, feeService, examService, academicService, storageService, documentService
│   ├── hooks/                    # useStudents, useAcademicSession
│   ├── templates/                # MarksheetTemplate, StudentIdCardTemplate, AdmitCardTemplate, FeeReceiptTemplate, AdmissionFormTemplate, ProvisionalCertificateTemplate
│   └── config/
│       └── appConfig.js          # Institution branding & configuration defaults
├── tests/
│   └── calculations.test.mjs     # Automated unit tests for grades, amounts, and persistence
├── .env.example
├── package.json
└── README.md
```

---

## 3. Installation & Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` or `v22+`
- npm `v9+` or `v10+`

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application will start in **Local Demo / Persistent Mode** immediately, with 15+ pre-seeded student records, exam marks, and fee receipts.

### 3. Run Automated Unit Tests
```bash
npm test
```
Executes verified test suites for grade scale calculations, number-to-words currency formatting, unique ID generators, and the storage service CRUD workflow.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 4. Google Sheets & Cloud Drive Setup Guide

The application supports dual storage modes:
1. **Local Persistent Mode (Default)**: Saves all modifications to `data/school_database.json` on the server. Zero external configuration required.
2. **Google Sheets Cloud Mode**: Automatically activates when environment variables are supplied.

### Step-by-Step Google Sheets API Setup

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project (e.g. `School-Management-System`).
2. **Enable Required APIs**:
   - Navigate to **APIs & Services** > **Library**.
   - Enable **Google Sheets API**.
   - Enable **Google Drive API** (optional, for student photo storage).
3. **Create a Service Account**:
   - Go to **APIs & Services** > **Credentials** > **Create Credentials** > **Service Account**.
   - Give it a name (e.g. `sms-sheets-sync`) and click **Done**.
   - Click on the created service account, go to the **Keys** tab > **Add Key** > **Create new key** > Select **JSON**.
   - Download the JSON key file.
4. **Create your Google Sheet**:
   - Open [Google Sheets](https://sheets.new) and create a new blank workbook.
   - Name it `School Management Database`.
   - Copy the **Spreadsheet ID** from the URL bar:
     `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
5. **Share the Sheet with the Service Account**:
   - Click the green **Share** button on your Google Sheet.
   - Paste the service account email (e.g. `sms-sheets-sync@your-project.iam.gserviceaccount.com`) as an **Editor**.
6. **Configure Environment Variables**:
   Create a `.env.local` file in your project root:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID="your_google_sheet_id_here"
   GOOGLE_DRIVE_FOLDER_ID="optional_google_drive_folder_id"
   ```

---

## 5. Google Sheets Data Architecture

When connected, the data access layer structures data across 14 dedicated worksheets:

| Worksheet | Purpose | Key Columns |
| :--- | :--- | :--- |
| `Students` | Student and parent information | `admissionNumber`, `studentName`, `dateOfBirth`, `gender`, `bloodGroup`, `studentPhoto`, `contactNumber`, `email`, `residentialAddress`, `academicSession`, `className`, `section`, `rollNumber`, `admissionDate`, `status`, `fatherName`, `motherName`, `parentContact` |
| `AcademicSessions` | Academic calendar years | `id`, `name`, `startDate`, `endDate`, `isActive` |
| `Classes` | School classes & section allocations | `id`, `name`, `level`, `sections` |
| `Examinations` | Terms & examination names | `id`, `name`, `term`, `weightage` |
| `ExaminationSchedule` | Official exam timetable | `id`, `examinationName`, `academicSession`, `className`, `subject`, `examDate`, `startTime`, `endTime`, `roomNumber`, `maxMarks`, `passMarks` |
| `Marks` | Subject marks & evaluation | `id`, `admissionNumber`, `academicSession`, `examinationName`, `className`, `section`, `subject`, `maxMarks`, `passMarks`, `marksObtained`, `isAbsent`, `grade`, `remarks` |
| `FeeStructure` | Fee schedules by class | `id`, `academicSession`, `className`, `category`, `amount`, `frequency` |
| `FeePayments` | Verified payment audit ledger | `receiptNumber`, `admissionNumber`, `studentName`, `academicSession`, `className`, `feeCategory`, `amountPaid`, `paymentMode`, `paymentDate`, `transactionRef`, `receivedBy`, `remarks` |
| `Settings` | Institution profile & branding | `key`, `value`, `updatedAt` |
| `AuditLog` | Administrative action audit log | `id`, `action`, `entity`, `entityId`, `details`, `performedBy`, `timestamp` |

---

## 6. School Document Generation & Printing

The system includes 7 printable document templates designed with standard physical dimensions:

1. **Official Marksheet / Report Card** (`src/templates/MarksheetTemplate.js`):
   - Academic session, student biodata, subject-wise table, maximum marks, minimum pass marks, marks obtained, auto-computed percentage, grades according to CBSE scale (A1 to E), pass/fail evaluation, teacher remarks, and principal seal.
2. **Standard Horizontal Student ID Card** (`src/templates/StudentIdCardTemplate.js`):
   - Standard CR-80 card layout (85.6mm × 54mm) with school header, student photograph, admission number, roll number, blood group, emergency contact, and principal signature.
3. **Vertical Portrait Student ID Badge** (`src/templates/StudentIdCardTemplate.js`):
   - Portrait format (54mm × 85.6mm) optimized for standard plastic card holders and lanyards.
4. **Examination Admit Card / Hall Ticket** (`src/templates/AdmitCardTemplate.js`):
   - Candidate details, photograph, examination timetable schedule, room allocation, examination rules, and candidate/invigilator signature lines.
5. **Official Fee Receipt** (`src/templates/FeeReceiptTemplate.js`):
   - 2-part receipt (Student/Parent Copy & School Office Copy) with unique receipt number, payment mode, transaction reference, amount in numbers and Indian English words, remaining balance, and cashier signature.
6. **Student Admission Form** (`src/templates/AdmissionFormTemplate.js`):
   - Formal admission record including student photo, father photo, mother photo, demographic details, parent declaration, and office verification block.
7. **Provisional / Character Certificate** (`src/templates/ProvisionalCertificateTemplate.js`):
   - Formal ornate institution certificate for school transfers, character attestations, or bonafide student proof.

### Print & PDF Generation Options
- **Native Browser Print**: Click **Print Document** on any template. The print stylesheet in `src/app/globals.css` (`@media print`) automatically removes the sidebar, navigation, and dashboard controls, applies exact page boundaries, and forces background colors.
- **Client-Side PDF Download**: Click **Download PDF** to generate an exact high-resolution `.pdf` file via `html2canvas` and `jsPDF`.

---

## 7. Excel Import & Export Center

Located at `/excel`:
- **Sample Template**: Download `Student_Import_Template.xlsx` pre-filled with the exact expected schema.
- **Pre-Validation**: Validates required fields, checks date formats, and identifies duplicate admission numbers against the database before committing any rows.
- **Row-Level Error Reporting**: Detailed error log highlighting the row number and specific error for any invalid record.
- **Exports**: One-click download of live databases for:
  - Student Directory (`.xlsx`)
  - Fee Payment Records (`.xlsx`)
  - Examination Marks (`.xlsx`)

---

## 8. Tailwind CSS Reference for React Native Developers

If you are accustomed to React Native `StyleSheet.create` or traditional CSS, here is a quick mapping of the most commonly used utility classes in this codebase:

| Tailwind Class | Traditional CSS Equivalent | React Native Equivalent |
| :--- | :--- | :--- |
| `flex flex-col` | `display: flex; flex-direction: column;` | `flexDirection: 'column'` |
| `items-center` | `align-items: center;` | `alignItems: 'center'` |
| `justify-between` | `justify-content: space-between;` | `justifyContent: 'space-between'` |
| `gap-4` | `gap: 1rem; (16px)` | `gap: 16` |
| `p-6` / `px-4 py-2` | `padding: 1.5rem;` / `padding: 8px 16px;` | `padding: 24` / `paddingHorizontal: 16, paddingVertical: 8` |
| `bg-slate-900` | `background-color: #0f172a;` | `backgroundColor: '#0f172a'` |
| `text-white font-bold`| `color: #ffffff; font-weight: 700;` | `color: '#fff', fontWeight: 'bold'` |
| `rounded-xl` | `border-radius: 0.75rem; (12px)` | `borderRadius: 12` |
| `border border-slate-200` | `border: 1px solid #e2e8f0;` | `borderWidth: 1, borderColor: '#e2e8f0'` |
| `shadow-xs` / `shadow-md` | `box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);` | `elevation: 2, shadowOpacity: 0.1` |
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` | `numberOfLines: 1` |
| `font-mono` | `font-family: monospace;` | `fontFamily: 'Courier'` |

---

## 9. Security & Production Deployment

- **Credential Isolation**: Google API private keys and service account emails are evaluated exclusively inside server-side route handlers (`src/app/api/...`) and are never exposed in client bundles.
- **Auditing**: Important administrative actions (new admissions, fee collections, marks entries) are logged to the `AuditLog` ledger with timestamps and user identifiers.
- **Zero Database Server Requirement**: The project can be deployed directly to Vercel, Netlify, or any Next.js-compatible container without provisioning PostgreSQL or MySQL.
