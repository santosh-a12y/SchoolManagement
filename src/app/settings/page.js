"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import appConfig from "@/config/appConfig";
import {
  Settings,
  Cloud,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  FileSpreadsheet,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { compressImage, fileToDataUrl } from "@/lib/imageCompression";

export default function SettingsPage() {
  const [schoolSettings, setSchoolSettings] = useState(appConfig.school);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      let fileToUpload = file;
      if (typeof window !== "undefined" && file.type?.startsWith("image/")) {
        try {
          fileToUpload = await compressImage(file, 400, 400, 0.85);
        } catch (e) {
          console.warn("Logo compression error, using raw file:", e);
        }
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to upload logo image");
      }
      setSchoolSettings((prev) => ({
        ...prev,
        logoUrl: data.url,
      }));
    } catch (err) {
      if (file) {
        try {
          const directDataUrl = await fileToDataUrl(file);
          if (directDataUrl) {
            setSchoolSettings((prev) => ({
              ...prev,
              logoUrl: directDataUrl,
            }));
            return;
          }
        } catch {}
      }
      alert("Logo upload failed: " + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/status", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([settingsData, statusData]) => {
        if (settingsData.success) {
          setSchoolSettings(settingsData.data);
        }
        if (statusData.success) {
          setStatus(statusData);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("school_settings_updated", { detail: data.data || schoolSettings })
          );
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isGoogleConnected = status?.mode === "google_sheets";

  return (
    <AppLayout>
      <PageHeader
        title="School Settings & Cloud Sync"
        subtitle="Manage institution profile, printable document headers, and Google Sheets cloud integration"
        breadcrumbs={[{ label: "Settings" }]}
        actions={
          <Link href="/settings/users">
            <Button variant="primary" size="sm" icon={ShieldCheck}>
              Manage Users & Permissions
            </Button>
          </Link>
        }
      />

      {/* Cloud Integration Status Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isGoogleConnected
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {isGoogleConnected ? <Cloud className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Primary Data Store:{" "}
                {isGoogleConnected ? "Google Sheets (Cloud)" : "Offline / Demo Mode"}
              </h3>
              <p className="text-xs text-slate-500">
                {isGoogleConnected
                  ? "Connected via Google Service Account (Secure Server-Side)"
                  : "Persistent Server File Store (`data/school_database.json`)"}
              </p>
            </div>
          </div>

          <Badge variant={isGoogleConnected ? "emerald" : "amber"} size="lg">
            {isGoogleConnected ? "Cloud Sync Active" : "Local Persistent Mode"}
          </Badge>
        </div>

        {/* Setup / Connection Details */}
        <div className="text-xs text-slate-600 space-y-3">
          {isGoogleConnected ? (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Google Sheets integration is active and operating securely.
              </div>
              <p className="text-[11px] text-emerald-700">
                All database operations are read and written directly to your Google Spreadsheet via the Google Sheets API v4.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                How to connect your live Google Sheets workbook:
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li>Create a Google Cloud Project and enable the <strong>Google Sheets API</strong> and <strong>Google Drive API</strong>.</li>
                <li>Create a <strong>Service Account</strong> and generate a JSON Key.</li>
                <li>Create a blank Google Spreadsheet in Google Drive and click <strong>Share</strong> to share edit access with your service account email.</li>
                <li>Add the following environment variables to your <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env.local</code> file:</li>
              </ol>

              <pre className="p-3 bg-slate-900 text-slate-100 rounded-md font-mono text-[11px] overflow-x-auto">
{`GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SHEET_ID="your_google_sheet_id_here"
GOOGLE_DRIVE_FOLDER_ID="your_optional_drive_folder_id"`}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* School Profile Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Institution Profile & Document Headers</h3>
            <p className="text-xs text-slate-500">
              Details configured here will appear on official Marksheets, Admit Cards, Receipts, and ID Cards.
            </p>
          </div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved!
            </span>
          )}
        </div>

        {/* School Logo & Sidebar Icon Branding */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              School Logo & Sidebar Icon
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Upload your official school emblem. It will display in the sidebar just before the school name, in the navigation header, and across official printable certificates.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Live Preview Box */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs shrink-0">
              <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-1 relative overflow-hidden">
                {schoolSettings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={schoolSettings.logoUrl}
                    alt="School Logo"
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="w-full h-full rounded bg-blue-600 text-white font-bold text-xs tracking-wider flex items-center justify-center">
                    {schoolSettings.logoText || "LOGO"}
                  </div>
                )}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">Sidebar Icon</span>
                <span className="text-slate-500 text-[11px]">
                  {schoolSettings.logoUrl ? "Custom Logo Active" : "Monogram Fallback"}
                </span>
              </div>
            </div>

            {/* Upload Button & Inputs */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="school-logo-file-input"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
                    isUploadingLogo
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingLogo ? "Uploading..." : "Upload Logo Image"}
                  <input
                    id="school-logo-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    disabled={isUploadingLogo}
                    onChange={handleLogoUpload}
                  />
                </label>

                {schoolSettings.logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setSchoolSettings((prev) => ({ ...prev, logoUrl: "" }))}
                  >
                    Remove Logo
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="Logo Monogram / Fallback Text (e.g. OXFORD or SAE)"
                  placeholder="OXFORD"
                  value={schoolSettings.logoText || ""}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, logoText: e.target.value })}
                />
                <Input
                  label="Direct Logo URL / Path (Optional)"
                  placeholder="/uploads/... or https://..."
                  value={schoolSettings.logoUrl || ""}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, logoUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="School Name"
            required
            value={schoolSettings.name || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, name: e.target.value })}
          />
          <Input
            label="School Motto / Tagline"
            value={schoolSettings.tagline || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, tagline: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Affiliation Code / Registration"
            value={schoolSettings.affiliationNo || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, affiliationNo: e.target.value })}
          />
          <Input
            label="School Code"
            value={schoolSettings.schoolCode || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolCode: e.target.value })}
          />
          <Input
            label="Established Year"
            value={schoolSettings.establishedYear || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, establishedYear: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Phone Number"
            value={schoolSettings.phone || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, phone: e.target.value })}
          />
          <Input
            label="Emergency Contact"
            value={schoolSettings.emergencyContact || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, emergencyContact: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            value={schoolSettings.email || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Official Address"
            value={schoolSettings.address || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, address: e.target.value })}
          />
          <Input
            label="Website"
            value={schoolSettings.website || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, website: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <Input
            label="Principal & Head of Institution Name"
            required
            value={schoolSettings.principalName || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, principalName: e.target.value })}
          />
          <Input
            label="Principal Signature Title"
            value={schoolSettings.principalSignTitle || ""}
            onChange={(e) => setSchoolSettings({ ...schoolSettings, principalSignTitle: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end pt-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            isLoading={isSaving}
          >
            Save Profile Settings
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
