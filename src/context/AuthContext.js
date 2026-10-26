"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_USERS, hasPermission as checkPerm, hasAnyPermission as checkAnyPerm } from "@/lib/permissions";

const AuthContext = createContext({
  currentUser: null,
  isAuthenticated: false,
  users: DEFAULT_USERS,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  switchUser: () => {},
  refreshUsers: async () => {},
  hasPermission: () => false,
  hasAny: () => false,
});

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsersAndSession = useCallback(async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      let currentUsersList = DEFAULT_USERS;
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          currentUsersList = json.data;
          setUsers(json.data);
        }
      }

      // Check session in storage
      if (typeof window !== "undefined") {
        const savedSession = localStorage.getItem("active_auth_session") || sessionStorage.getItem("active_auth_session");
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            // Verify user still exists in current users list
            const matched = currentUsersList.find((u) => u.id === parsed.id);
            if (matched && matched.status === "Active") {
              setCurrentUser(matched);
            } else {
              localStorage.removeItem("active_auth_session");
              sessionStorage.removeItem("active_auth_session");
              setCurrentUser(null);
            }
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.warn("Failed to load users from API:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsersAndSession();
  }, [loadUsersAndSession]);

  const login = async (emailOrUsername, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Authentication failed");
    }

    setCurrentUser(json.user);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_auth_session", JSON.stringify(json.user));
    }
    return json.user;
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("active_auth_session");
      sessionStorage.removeItem("active_auth_session");
      localStorage.removeItem("active_user_id");
      window.location.href = "/login";
    }
  };

  const switchUser = (userId) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      if (typeof window !== "undefined") {
        localStorage.setItem("active_auth_session", JSON.stringify(found));
      }
    }
  };

  const hasPermission = useCallback(
    (perm) => {
      if (!currentUser) return false;
      return checkPerm(currentUser.permissions, perm);
    },
    [currentUser]
  );

  const hasAny = useCallback(
    (permList) => {
      if (!currentUser) return false;
      return checkAnyPerm(currentUser.permissions, permList);
    },
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        users,
        isLoading,
        login,
        logout,
        switchUser,
        refreshUsers: loadUsersAndSession,
        hasPermission,
        hasAny,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
