"use client";

import { useState, useEffect, useCallback } from "react";
import studentService from "@/services/studentService";

export function useStudents(initialFilters = {}) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudents(filters);
      setStudents(data);
    } catch (err) {
      setError(err.message || "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchStudents,
  };
}

export default useStudents;
