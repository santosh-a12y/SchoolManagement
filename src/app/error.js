"use client";

import React, { useEffect } from "react";
import Button from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        An error occurred while loading this administrative section. Please try again or check server logs.
      </p>
      <Button variant="primary" icon={RefreshCw} onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
