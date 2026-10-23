/**
 * Application Configuration & School Profile
 * 
 * Default values can be customized via the Settings page or environment variables.
 */

export const appConfig = {
  appName: "Student Management System",
  version: "1.0.0",
  school: {
    name: "OXFORD Academy of Excellence",
    tagline: "Inspiring Young Minds, Shaping Future Leaders",
    affiliationNo: "CBSE/AFF/2026/89401",
    schoolCode: "SCH-98210",
    address: "Plot 42, Knowledge Boulevard, Sector 12, New Delhi - 110001",
    phone: "+91 11 2345 6789",
    emergencyContact: "+91 98765 43210",
    email: "admissions@springfieldacademy.edu",
    website: "www.springfieldacademy.edu",
    establishedYear: "1998",
    principalName: "Dr. Eleanor Vance, Ph.D. (Ed)",
    principalSignTitle: "Principal & Head of Institution",
    logoText: "SAE",
    currency: "INR",
    currencySymbol: "₹",
  },
  defaultSession: "2026-27",
  demoModeNotice: "Running in Local Offline Persistent Mode. Connect Google Sheets in Settings for cloud synchronization.",
};

export default appConfig;
