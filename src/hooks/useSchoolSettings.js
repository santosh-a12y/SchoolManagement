"use client";

import { useState, useEffect } from "react";
import appConfig from "@/config/appConfig";

export function useSchoolSettings() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("app_school_settings");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return appConfig.school;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data) {
            setSettings(json.data);
            try {
              sessionStorage.setItem("app_school_settings", JSON.stringify(json.data));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic settings:", err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSettings();

    // Listen for custom settings update events
    const handleSettingsUpdated = (e) => {
      if (e.detail) {
        setSettings(e.detail);
        try {
          sessionStorage.setItem("app_school_settings", JSON.stringify(e.detail));
        } catch {}
      }
    };
    window.addEventListener("school_settings_updated", handleSettingsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("school_settings_updated", handleSettingsUpdated);
    };
  }, []);

  return { settings, isLoading };
}

export default useSchoolSettings;
