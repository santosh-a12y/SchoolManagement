"use client";

import { useState, useEffect, useCallback } from "react";
import academicService from "@/services/academicService";
import appConfig from "@/config/appConfig";

export function useAcademicSession() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSessionState] = useState(appConfig.defaultSession);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const data = await academicService.getSessions();
      setSessions(data);
      const active = data.find((s) => s.isActive);
      if (active) {
        setActiveSessionState(active.id);
      }
    } catch (err) {
      console.warn("Could not load sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const switchActiveSession = async (sessionId) => {
    try {
      await academicService.setActiveSession(sessionId);
      setActiveSessionState(sessionId);
      await loadSessions();
      return true;
    } catch (err) {
      console.error("Failed to switch session:", err);
      return false;
    }
  };

  return {
    sessions,
    activeSession,
    isLoading,
    switchActiveSession,
    reload: loadSessions,
  };
}

export default useAcademicSession;
