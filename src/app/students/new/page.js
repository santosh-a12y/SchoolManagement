"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import StudentForm from "@/components/students/StudentForm";

export default function NewStudentPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <PageHeader
        title="New Student Admission"
        subtitle="Complete the student registration and parent details form"
        breadcrumbs={[
          { label: "Students", href: "/students" },
          { label: "New Admission" },
        ]}
      />

      <StudentForm
        onSubmitSuccess={(createdStudent) => {
          router.push(`/students/${createdStudent.admissionNumber}`);
        }}
        onCancel={() => router.push("/students")}
      />
    </AppLayout>
  );
}
