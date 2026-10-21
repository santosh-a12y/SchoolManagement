import "./globals.css";
import appConfig from "@/config/appConfig";

export const metadata = {
  title: `${appConfig.school.name} — Student Management System`,
  description: "Comprehensive school administration system for student admissions, marks, ID cards, admit cards, and fees.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}
