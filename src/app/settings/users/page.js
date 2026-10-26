"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { PERMISSION_MODULES, ROLE_PRESETS } from "@/lib/permissions";
import { formatDate } from "@/lib/formatters";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
  RefreshCw,
  Zap,
  Check,
  Sparkles,
  Key,
  Shield,
  Layers,
  GraduationCap,
  BadgeDollarSign,
  FileCheck,
  Settings,
} from "lucide-react";

export default function UsersPage() {
  const { currentUser, users, switchUser, refreshUsers } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getModuleIcon = (moduleId) => {
    switch (moduleId) {
      case "students":
        return <Users className="w-4 h-4 text-blue-600" />;
      case "fees":
        return <BadgeDollarSign className="w-4 h-4 text-emerald-600" />;
      case "academics":
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case "documents":
        return <FileCheck className="w-4 h-4 text-amber-600" />;
      case "system":
        return <Settings className="w-4 h-4 text-slate-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("staff123");
    setFormRole("Staff Member");
    setFormStatus("Active");
    setSelectedPermissions(["students.view", "documents.cards"]);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormPassword(user.password || "");
    setFormRole(user.role || "");
    setFormStatus(user.status || "Active");
    setSelectedPermissions(Array.isArray(user.permissions) ? [...user.permissions] : []);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // 1-Click Role Preset selection
  const handleApplyPreset = (preset) => {
    setFormRole(preset.roleTitle);
    if (preset.permissions.includes("*")) {
      // Collect all available permissions
      const allPerms = [];
      PERMISSION_MODULES.forEach((mod) => {
        mod.permissions.forEach((p) => allPerms.push(p.id));
      });
      setSelectedPermissions(["*", ...allPerms]);
    } else {
      setSelectedPermissions([...preset.permissions]);
    }
  };

  // Toggle individual permission checkbox
  const handleTogglePermission = (permId) => {
    if (selectedPermissions.includes("*")) {
      // If user had full access, expand to explicit checkboxes minus this one
      const allPerms = [];
      PERMISSION_MODULES.forEach((mod) => {
        mod.permissions.forEach((p) => {
          if (p.id !== permId) allPerms.push(p.id);
        });
      });
      setSelectedPermissions(allPerms);
      return;
    }

    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  // Toggle all permissions for an entire module
  const handleToggleModule = (mod) => {
    const modPermIds = mod.permissions.map((p) => p.id);
    const hasAll = modPermIds.every((id) => selectedPermissions.includes(id) || selectedPermissions.includes("*"));

    if (hasAll) {
      // Deselect all in this module
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== "*" && !modPermIds.includes(id))
      );
    } else {
      // Add all missing in this module
      const unique = new Set([...selectedPermissions, ...modPermIds]);
      setSelectedPermissions(Array.from(unique));
    }
  };

  const handleSelectAll = () => {
    const all = ["*"];
    PERMISSION_MODULES.forEach((mod) => {
      mod.permissions.forEach((p) => all.push(p.id));
    });
    setSelectedPermissions(all);
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim()) {
      setErrorMsg("Full Name and User Role Title are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const rawId = formEmail.trim().toLowerCase();
      const isEmail = rawId.includes("@");
      const payload = {
        name: formName.trim(),
        email: isEmail ? rawId : "",
        username: !isEmail && rawId ? rawId : undefined,
        password: formPassword.trim() || (editingUser?.password || "staff123"),
        role: formRole.trim(),
        status: formStatus,
        permissions: selectedPermissions,
      };

      let res;
      if (editingUser) {
        res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to save user");
      }

      await refreshUsers();
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === "usr-admin") {
      alert("The primary Super Admin account cannot be deleted.");
      return;
    }

    if (!confirm("Are you sure you want to remove this user profile?")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to delete user");
      }
      await refreshUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Staff Member",
      sortable: true,
      render: (val, u) => {
        const isCurrent = u.id === currentUser?.id;
        const initials = u.name
          ? u.name
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : "ST";

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{u.name}</span>
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Active Session
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">{u.email || "No email assigned"}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "User Role Title",
      sortable: true,
      render: (role) => {
        const roleStr = role || "Staff";
        let color = "bg-slate-100 text-slate-700 border-slate-200";
        if (roleStr.toLowerCase().includes("admin")) color = "bg-purple-50 text-purple-700 border-purple-200";
        else if (roleStr.toLowerCase().includes("account")) color = "bg-emerald-50 text-emerald-700 border-emerald-200";
        else if (roleStr.toLowerCase().includes("teacher")) color = "bg-blue-50 text-blue-700 border-blue-200";
        else if (roleStr.toLowerCase().includes("clerk")) color = "bg-amber-50 text-amber-700 border-amber-200";

        return (
          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${color}`}>
            {roleStr}
          </span>
        );
      },
    },
    {
      key: "permissions",
      label: "Accessible Modules",
      render: (perms) => {
        const permList = perms || [];
        if (permList.includes("*") || permList.includes("all")) {
          return (
            <Badge variant="emerald" size="sm">
              ⭐ Full System Access
            </Badge>
          );
        }

        const accessibleModules = PERMISSION_MODULES.filter((mod) =>
          mod.permissions.some((p) => permList.includes(p.id))
        );

        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {accessibleModules.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {m.label.split(" ")[0]}
              </span>
            ))}
            {accessibleModules.length === 0 && (
              <span className="text-xs text-slate-400 italic">No modules granted</span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => (
        <Badge variant={status === "Active" ? "emerald" : "slate"} size="sm">
          {status || "Active"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, u) => {
        const isCurrent = u.id === currentUser?.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => switchUser(u.id)}
              disabled={isCurrent}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
              }`}
              title={isCurrent ? "Currently active user" : "Switch to this role to preview dashboard"}
            >
              {isCurrent ? "Active" : "Switch To"}
            </button>
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => handleOpenEditModal(u)}
              title="Edit Role & Permissions"
            >
              Edit
            </Button>
            {u.id !== "usr-admin" && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteUser(u.id)}
                title="Delete User"
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Users & Permissions Management"
        subtitle="Configure staff accounts, assign custom role titles, and set granular access checkboxes across modules"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={refreshUsers}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" icon={UserPlus} onClick={handleOpenCreateModal}>
              Add New User
            </Button>
          </div>
        }
      />

      {/* Role Preset Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Administrator Preset</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Full control over all students, fees, examinations, marks, certificates, and cloud sync.
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BadgeDollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Accountant Preset</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Access fee structures, record payments, provide early bird discounts, and print receipts.
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Teacher Preset</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Access class rosters, enter subject marks, apply grace marks, and preview student marksheets.
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Front Desk Clerk Preset</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Admit new students, collect fee installments, and generate student ID & admit cards.
            </div>
          </div>
        </div>
      </div>

      {/* Staff Directory Table */}
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users by name, role, or email..."
      />

      {/* Add / Edit User Modal with Custom Role Input & Checkbox Matrix */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.name}` : "Create New Staff Account"}
        subtitle="Enter role title and check the boxes for each module this user is authorized to access"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveUser} className="space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Basic Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Staff Full Name"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Input
              label="Email / Staff Login ID"
              type="text"
              placeholder="e.g. ramesh@school.com or ramesh123"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                label="Login Password"
                type="text"
                icon={Lock}
                placeholder="e.g. staff123"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                helperText={
                  editingUser
                    ? "Leave as is or type a new password to update this user's portal credentials."
                    : "Default initial password is 'staff123'. Staff can use this to sign in."
                }
              />
            </div>
          </div>

          {/* User Role Input and Quick Preset Selector */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                User Role Title (Custom Input)
              </label>
              <div className="text-[11px] text-slate-500">
                Type any custom role or click a preset below:
              </div>
            </div>

            <Input
              placeholder="e.g. Senior Accountant, Science Faculty, Admission Officer"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              required
            />

            {/* 1-Click Role Presets */}
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                ⚡ 1-Click Role Presets (Auto-fills recommended checkboxes):
              </span>
              <div className="flex flex-wrap gap-2">
                {ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permission Checkbox Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Module Access & Feature Permissions</h4>
                <p className="text-[11px] text-slate-500">
                  Select which dashboard tiles and sections this user can view and manage:
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Checkbox Groupings per Module */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {PERMISSION_MODULES.map((mod) => {
                const modPermIds = mod.permissions.map((p) => p.id);
                const isFullAdmin = selectedPermissions.includes("*");
                const allChecked = isFullAdmin || modPermIds.every((id) => selectedPermissions.includes(id));
                const someChecked = !allChecked && modPermIds.some((id) => selectedPermissions.includes(id));

                return (
                  <div
                    key={mod.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    {/* Module Title with Batch Toggle */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        {getModuleIcon(mod.id)}
                        <span className="text-xs font-bold text-slate-900">{mod.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleModule(mod)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        {allChecked ? "Deselect Module" : "Select All in Module"}
                      </button>
                    </div>

                    {/* Checkboxes in this module */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {mod.permissions.map((perm) => {
                        const checked = isFullAdmin || selectedPermissions.includes(perm.id);

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                              checked
                                ? "bg-blue-50/60 border-blue-200 text-blue-900"
                                : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
                            />
                            <div className="text-left">
                              <div className="text-xs font-semibold leading-tight">{perm.label}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                {perm.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Selected permissions: <strong>{selectedPermissions.includes("*") ? "All (Full Admin)" : selectedPermissions.length}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingUser ? "Save User Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
