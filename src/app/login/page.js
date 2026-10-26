"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import useSchoolSettings from "@/hooks/useSchoolSettings";
import appConfig from "@/config/appConfig";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  KeyRound,
  GraduationCap,
  BadgeDollarSign,
  FileCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { settings } = useSchoolSettings();
  const { currentUser, login, isAuthenticated } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg("Please enter both your Email / Username and Password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const user = await login(identifier.trim(), password.trim());
      setSuccessMsg(`Welcome, ${user.name}! Redirecting to your dashboard...`);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your Email/Username and Password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillCredentials = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Institution Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-4">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-12 h-12 object-contain rounded-xl bg-white p-1"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-inner">
              {settings.logoText || "OXFORD"}
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {settings.name || appConfig.school.name}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
          Official Administrative & Staff Management Portal
        </p>
        <div className="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
          Academic Session: {settings.activeSession || appConfig.defaultSession}
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>Staff Authentication</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your assigned ID and password to access your role-permitted dashboard.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Authentication Failed</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff ID / Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin@oxfordacademy.edu.in"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Staff Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ⭐ Authorized Staff Credentials
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Click to Autofill</span>
            </div>

            {/* Admin Credentials Card (Highlighted) */}
            <div
              onClick={() => handleFillCredentials("admin@oxfordacademy.edu.in", "admin123")}
              className="p-3 mb-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <span>Super Administrator</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-200 text-purple-900 font-bold uppercase">
                      Full Access
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-700 font-mono mt-0.5">
                    ID: <strong>admin@oxfordacademy.edu.in</strong> | Pass: <strong>admin123</strong>
                  </div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform shrink-0" />
            </div>

            {/* Other Staff Credentials (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleFillCredentials("accounts@oxfordacademy.edu.in", "acc123")}
                className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">
                  <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accountant</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">pass: acc123</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("teacher@oxfordacademy.edu.in", "teacher123")}
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-blue-700">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Teacher</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">pass: teacher123</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("clerk@oxfordacademy.edu.in", "clerk123")}
                className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-amber-700">
                  <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Clerk</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">pass: clerk123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Notice */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          🔒 Secure Role-Based School Administration Portal • CBSE Affiliation No: {settings.affiliationNo || "CBSE/AFF/2026/89401"}
        </p>
      </div>
    </div>
  );
}
