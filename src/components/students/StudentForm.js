"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { studentSchema, createZodResolver } from "@/lib/validators";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import studentService from "@/services/studentService";
import {
  SCHOOL_CLASSES,
  SECTIONS,
  GENDERS,
  BLOOD_GROUPS,
  STUDENT_STATUSES,
  ACADEMIC_SESSIONS,
} from "@/lib/constants";
import { generateAdmissionNumber } from "@/lib/utils";
import { Camera, Upload, User, Save, X, AlertCircle } from "lucide-react";

export default function StudentForm({
  initialData = null,
  isEdit = false,
  onSubmitSuccess,
  onCancel,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [studentPhotoPreview, setStudentPhotoPreview] = useState(initialData?.studentPhoto || "");
  const [fatherPhotoPreview, setFatherPhotoPreview] = useState(initialData?.fatherPhoto || "");
  const [motherPhotoPreview, setMotherPhotoPreview] = useState(initialData?.motherPhoto || "");

  const defaultValues = initialData || {
    admissionNumber: generateAdmissionNumber(Math.floor(Math.random() * 800) + 100),
    studentName: "",
    dateOfBirth: "",
    gender: "Male",
    bloodGroup: "O+",
    studentPhoto: "",
    contactNumber: "",
    email: "",
    residentialAddress: "",
    academicSession: "2026-27",
    className: "Class 1",
    section: "A",
    rollNumber: "01",
    admissionDate: new Date().toISOString().split("T")[0],
    status: "Active",
    fatherName: "",
    fatherPhoto: "",
    fatherOccupation: "",
    motherName: "",
    motherPhoto: "",
    motherOccupation: "",
    guardianName: "",
    guardianRelation: "",
    parentContact: "",
    parentEmail: "",
    emergencyContact: "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: createZodResolver(studentSchema),
    defaultValues,
  });

  const handlePhotoUpload = async (file, type) => {
    if (!file) return;
    try {
      const url = await studentService.uploadPhoto(file);
      if (type === "student") {
        setStudentPhotoPreview(url);
        setValue("studentPhoto", url);
      } else if (type === "father") {
        setFatherPhotoPreview(url);
        setValue("fatherPhoto", url);
      } else if (type === "mother") {
        setMotherPhotoPreview(url);
        setValue("motherPhoto", url);
      }
    } catch (err) {
      alert("Failed to upload photo: " + err.message);
    }
  };

  const onFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (isEdit) {
        await studentService.updateStudent(formData.admissionNumber, formData);
      } else {
        await studentService.createStudent(formData);
      }
      if (onSubmitSuccess) onSubmitSuccess(formData);
    } catch (err) {
      setFormError(err.message || "Failed to save student record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {formError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* SECTION 1: Academic & Admission Information */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Academic & Admission Details</h2>
            <p className="text-xs text-slate-500">Official school records and assignment</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Step 1 of 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Admission Number"
            required
            disabled={isEdit}
            {...register("admissionNumber")}
            error={errors.admissionNumber?.message}
            helperText="Unique permanent identifier"
          />
          <Select
            label="Academic Session"
            required
            options={ACADEMIC_SESSIONS.map((s) => ({ value: s.id, label: s.name }))}
            {...register("academicSession")}
            error={errors.academicSession?.message}
          />
          <Input
            label="Admission Date"
            type="date"
            required
            {...register("admissionDate")}
            error={errors.admissionDate?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Class"
            required
            options={SCHOOL_CLASSES}
            {...register("className")}
            error={errors.className?.message}
          />
          <Select
            label="Section"
            required
            options={SECTIONS}
            {...register("section")}
            error={errors.section?.message}
          />
          <Input
            label="Roll Number"
            required
            placeholder="e.g. 01"
            {...register("rollNumber")}
            error={errors.rollNumber?.message}
          />
          <Select
            label="Student Status"
            required
            options={STUDENT_STATUSES}
            {...register("status")}
            error={errors.status?.message}
          />
        </div>
      </div>

      {/* SECTION 2: Student Personal Information */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Personal Information</h2>
            <p className="text-xs text-slate-500">Student demographic details and photograph</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Step 2 of 3
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Photo Upload & Preview */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-32 h-36 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative group">
              {studentPhotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={studentPhotoPreview}
                  alt="Student Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400 p-2 text-center">
                  <User className="w-10 h-10 mb-1" />
                  <span className="text-[11px] font-medium">Student Photo</span>
                </div>
              )}
              <label
                htmlFor="student-photo-upload"
                className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span>Upload</span>
              </label>
              <input
                id="student-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0], "student")}
              />
            </div>
            <label
              htmlFor="student-photo-upload"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{studentPhotoPreview ? "Change Photo" : "Upload Photo"}</span>
            </label>
          </div>

          {/* Core Personal Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="md:col-span-2">
              <Input
                label="Student Full Name"
                required
                placeholder="e.g. Aarav Sharma"
                {...register("studentName")}
                error={errors.studentName?.message}
              />
            </div>
            <Input
              label="Date of Birth"
              type="date"
              required
              {...register("dateOfBirth")}
              error={errors.dateOfBirth?.message}
            />
            <Select
              label="Gender"
              required
              options={GENDERS}
              {...register("gender")}
              error={errors.gender?.message}
            />
            <Select
              label="Blood Group"
              options={BLOOD_GROUPS}
              {...register("bloodGroup")}
              error={errors.bloodGroup?.message}
            />
            <Input
              label="Student Contact / WhatsApp"
              placeholder="+91 98765 43210"
              {...register("contactNumber")}
              error={errors.contactNumber?.message}
            />
            <div className="md:col-span-2">
              <Input
                label="Student Email Address"
                type="email"
                placeholder="student@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
            <div className="md:col-span-3">
              <Input
                label="Residential Address"
                required
                placeholder="House No, Street, Locality, City, PIN"
                {...register("residentialAddress")}
                error={errors.residentialAddress?.message}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Parent & Guardian Information */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Parent & Guardian Information</h2>
            <p className="text-xs text-slate-500">Father, Mother, and emergency contact details</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Step 3 of 3
          </span>
        </div>

        {/* Father Details */}
        <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Father&apos;s Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Father's Name"
              required
              placeholder="e.g. Rajesh Sharma"
              {...register("fatherName")}
              error={errors.fatherName?.message}
            />
            <Input
              label="Father's Occupation"
              placeholder="e.g. Civil Engineer"
              {...register("fatherOccupation")}
              error={errors.fatherOccupation?.message}
            />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border border-slate-300 bg-white overflow-hidden flex items-center justify-center shrink-0">
                {fatherPhotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fatherPhotoPreview} alt="Father" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <label
                htmlFor="father-photo-upload"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Upload Father&apos;s Photo
                <input
                  id="father-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0], "father")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Mother Details */}
        <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Mother&apos;s Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Mother's Name"
              required
              placeholder="e.g. Pooja Sharma"
              {...register("motherName")}
              error={errors.motherName?.message}
            />
            <Input
              label="Mother's Occupation"
              placeholder="e.g. Architect"
              {...register("motherOccupation")}
              error={errors.motherOccupation?.message}
            />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border border-slate-300 bg-white overflow-hidden flex items-center justify-center shrink-0">
                {motherPhotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={motherPhotoPreview} alt="Mother" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <label
                htmlFor="mother-photo-upload"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Upload Mother&apos;s Photo
                <input
                  id="mother-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0], "mother")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <Input
            label="Primary Parent Contact No."
            required
            placeholder="+91 98111 22334"
            {...register("parentContact")}
            error={errors.parentContact?.message}
          />
          <Input
            label="Parent Email Address"
            type="email"
            placeholder="parent@example.com"
            {...register("parentEmail")}
            error={errors.parentEmail?.message}
          />
          <Input
            label="Emergency Contact No."
            placeholder="+91 98111 22335"
            {...register("emergencyContact")}
            error={errors.emergencyContact?.message}
          />
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <Button variant="outline" size="md" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Save}
          isLoading={isSubmitting}
        >
          {isEdit ? "Update Student Record" : "Complete Admission Registration"}
        </Button>
      </div>
    </form>
  );
}
