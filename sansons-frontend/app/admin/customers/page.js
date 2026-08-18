"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Trash2, UserPlus, ShieldAlert, Edit, Check, Shield, Lock, CheckSquare, Square, Search, Package } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/context/ToastContext";
import { formatDate } from "@/lib/utils";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from "@/lib/services/orderService";

const AVAILABLE_MODULES = [
  { id: "dashboard", label: "Dashboard", desc: "Overview metrics & revenue" },
  { id: "products", label: "Products", desc: "Manage catalog & multi-photo uploads" },
  { id: "categories", label: "Categories", desc: "Manage store categories" },
  { id: "orders", label: "Orders", desc: "View & update customer orders" },
  { id: "users", label: "Users & RBAC", desc: "Manage accounts & access control" },
  { id: "coupons", label: "Coupons", desc: "Manage promo discount codes" },
  { id: "cms", label: "Content (CMS)", desc: "Re-order homepage blocks & featured items" },
  { id: "settings", label: "Settings", desc: "Global store settings" },
];

const PREDEFINED_ROLES = [
  { value: "admin", label: "Admin (Full Access)" },
  { value: "seller", label: "Seller / Vendor" },
  { value: "manager", label: "Store Manager" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "support", label: "Support Agent" },
  { value: "purchaser", label: "Purchaser (Customer)" },
  { value: "custom", label: "Custom Role..." },
];

function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [roleSelect, setRoleSelect] = useState("seller");
  const [customRoleInput, setCustomRoleInput] = useState("");
  
  const [editRoleSelect, setEditRoleSelect] = useState("seller");
  const [editCustomRoleInput, setEditCustomRoleInput] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    status: "active",
    allowed_modules: ["dashboard", "products", "orders"]
  });

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    status: "active",
    allowed_modules: []
  });

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadUsers = () => {
    setLoading(true);
    getAdminUsers()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        setUsers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered users calculation with strict null safety
  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const role = (u.role || "").toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || fullName.includes(q) || email.includes(q) || role.includes(q);
    const matchesRole = roleFilter === "all" || role === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || (u.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u?.role === "admin").length,
    seller: users.filter((u) => u?.role === "seller").length,
    purchaser: users.filter((u) => u?.role === "purchaser" || u?.role === "customer").length,
    manager: users.filter((u) => (u?.role || "").toLowerCase().includes("manager") || u?.role === "support").length,
  };

  const toggleCreateModule = (modId) => {
    setForm((f) => {
      const exists = f.allowed_modules.includes(modId);
      const next = exists ? f.allowed_modules.filter((m) => m !== modId) : [...f.allowed_modules, modId];
      return { ...f, allowed_modules: next };
    });
  };

  const toggleEditModule = (modId) => {
    setEditForm((f) => {
      const exists = f.allowed_modules.includes(modId);
      const next = exists ? f.allowed_modules.filter((m) => m !== modId) : [...f.allowed_modules, modId];
      return { ...f, allowed_modules: next };
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const finalRole = roleSelect === "custom" ? customRoleInput.trim() : roleSelect;
    if (!finalRole) {
      showToast("Please enter a custom role name", "error");
      return;
    }

    try {
      await createAdminUser({
        ...form,
        role: finalRole,
      });
      showToast(`User ${form.email} created as ${finalRole}`, "success");
      setModalOpen(false);
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        status: "active",
        allowed_modules: ["dashboard", "products", "orders"]
      });
      setRoleSelect("seller");
      setCustomRoleInput("");
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to create user.";
      showToast(msg, "danger");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    const isPredefined = PREDEFINED_ROLES.some((r) => r.value === user.role);
    if (isPredefined) {
      setEditRoleSelect(user.role);
      setEditCustomRoleInput("");
    } else {
      setEditRoleSelect("custom");
      setEditCustomRoleInput(user.role);
    }

    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: "",
      status: user.status || "active",
      allowed_modules: Array.isArray(user.allowed_modules) ? user.allowed_modules : []
    });
    setEditModalOpen(true);
  };


  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const finalRole = editRoleSelect === "custom" ? editCustomRoleInput.trim() : editRoleSelect;
    if (!finalRole) {
      showToast("Please enter a custom role name", "error");
      return;
    }

    try {
      await updateAdminUser(selectedUser.id, {
        ...editForm,
        role: finalRole,
      });
      showToast(`User ${selectedUser.email} updated successfully`, "success");
      setEditModalOpen(false);
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to update user.";
      showToast(msg, "danger");
    }
  };

  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Are you sure you want to set status to "${newStatus}" for ${selectedUserIds.length} selected user(s)?`)) return;

    let updatedCount = 0;
    for (const id of selectedUserIds) {
      try {
        await updateAdminUser(id, { status: newStatus });
        updatedCount++;
      } catch (e) {}
    }
    showToast(`Updated ${updatedCount} user(s) to ${newStatus}.`, "success");
    setSelectedUserIds([]);
    loadUsers();
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`CAUTION: Are you sure you want to PERMANENTLY DELETE ${selectedUserIds.length} selected user account(s)?`)) return;

    let deletedCount = 0;
    for (const id of selectedUserIds) {
      try {
        await deleteAdminUser(id);
        deletedCount++;
      } catch (e) {}
    }
    showToast(`Permanently deleted ${deletedCount} user account(s).`, "success");
    setSelectedUserIds([]);
    loadUsers();
  };

  const handleToggleSuspendUser = async (u) => {
    const nextStatus = u.status === "suspended" ? "active" : "suspended";
    try {
      await updateAdminUser(u.id, { status: nextStatus });
      showToast(`User ${u.email} status changed to ${nextStatus}`, "success");
      loadUsers();
    } catch (e) {
      showToast("Failed to update user status", "danger");
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) return;
    try {
      await deleteAdminUser(id);
      showToast(`User ${email} deleted successfully`, "success");
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to delete user.";
      showToast(msg, "danger");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center pr-8 bg-paper border-b border-line">
        <AdminTopbar title="User Management & Access Control" />
        <Button onClick={() => setModalOpen(true)} variant="primary" className="flex items-center gap-2">
          <UserPlus size={16} />
          Create User with Access Control
        </Button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Role Quick Filter Pills & Search Bar */}
        <div className="bg-paper border border-line rounded-md p-5 space-y-4 shadow-soft">
          {/* Quick Role Badges */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-ink2 uppercase tracking-wider shrink-0 mr-1">Filter Role:</span>
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
                roleFilter === "all"
                  ? "bg-forest text-canvas border-forest shadow-sm"
                  : "bg-canvas border-line text-ink hover:border-ink"
              }`}
            >
              All Accounts ({roleCounts.all})
            </button>
            <button
              onClick={() => setRoleFilter("seller")}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
                roleFilter === "seller"
                  ? "bg-forest text-canvas border-forest shadow-sm"
                  : "bg-canvas border-line text-ink hover:border-ink"
              }`}
            >
              Sellers ({roleCounts.seller})
            </button>
            <button
              onClick={() => setRoleFilter("purchaser")}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
                roleFilter === "purchaser"
                  ? "bg-forest text-canvas border-forest shadow-sm"
                  : "bg-canvas border-line text-ink hover:border-ink"
              }`}
            >
              Purchasers / Guests ({roleCounts.purchaser})
            </button>
            <button
              onClick={() => setRoleFilter("admin")}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
                roleFilter === "admin"
                  ? "bg-forest text-canvas border-forest shadow-sm"
                  : "bg-canvas border-line text-ink hover:border-ink"
              }`}
            >
              Admins ({roleCounts.admin})
            </button>
            <button
              onClick={() => setRoleFilter("manager")}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shrink-0 ${
                roleFilter === "manager"
                  ? "bg-forest text-canvas border-forest shadow-sm"
                  : "bg-canvas border-line text-ink hover:border-ink"
              }`}
            >
              Managers ({roleCounts.manager})
            </button>
          </div>

          {/* Search Bar & Dropdown Selects */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink2" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-canvas border border-line rounded-lg pl-9 pr-4 py-2 text-xs text-ink placeholder:text-ink2 outline-none focus:border-forest"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink2 hover:text-ink font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-canvas border border-line rounded-lg px-3 py-2 text-xs text-ink outline-none focus:border-forest font-medium"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="seller">Seller / Vendor</option>
                  <option value="purchaser">Purchaser (Customer)</option>
                  <option value="admin">Admin</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="manager">Store Manager</option>
                  <option value="support">Support Agent</option>
                </select>
              </div>

              <div className="relative flex-1 sm:w-44">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-canvas border border-line rounded-lg px-3 py-2 text-xs text-ink outline-none focus:border-forest font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending_verification">Pending Verification</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedUserIds.length > 0 && (
          <div className="flex items-center justify-between bg-forest/10 border border-forest/30 rounded-md p-3.5 text-xs">
            <span className="font-semibold text-forest">
              {selectedUserIds.length} user account(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange("suspended")}
                className="px-3 py-1.5 bg-amber-600 text-white rounded font-medium hover:bg-amber-500 shadow-sm"
              >
                Suspend Selected ({selectedUserIds.length})
              </button>
              <button
                onClick={() => handleBulkStatusChange("active")}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-500 shadow-sm"
              >
                Activate Selected ({selectedUserIds.length})
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded font-medium hover:bg-red-500 shadow-sm"
              >
                Delete Selected ({selectedUserIds.length})
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-ink2 text-sm">Loading user accounts & permissions from database...</div>
        ) : (
          <div className="bg-paper border border-line rounded-md overflow-x-auto">
            <table className="w-full text-sm min-w-[950px]">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                      onChange={toggleSelectAll}
                      className="rounded border-line cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Allowed Module Access</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-ink2">
                      No users match your search/filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const mods = Array.isArray(u.allowed_modules) ? u.allowed_modules : [];
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <tr key={u.id} className={`border-t border-line transition-colors ${isSelected ? "bg-forest/5" : "hover:bg-canvas/10"}`}>
                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(u.id)}
                            className="rounded border-line cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-ink">{`${u.first_name} ${u.last_name}`.trim() || "User"}</p>
                          <p className="text-xs text-ink2">{u.email}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-forest/10 text-forest text-xs font-semibold uppercase tracking-wider">
                            <Shield size={12} /> {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          {u.role === "admin" ? (
                            <span className="text-xs text-forest font-medium">Full Access (All Modules)</span>
                          ) : mods.length === 0 ? (
                            <span className="text-xs text-ink2 italic">No modules granted</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {mods.map((m) => (
                                <span key={m} className="px-1.5 py-0.5 rounded bg-canvas2 border border-line text-[11px] font-mono text-ink2">
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-ink2 text-xs">{formatDate(u.created_at)}</td>
                        <td className="px-6 py-3.5">
                          <Badge tone={u.status === "active" ? "success" : "danger"}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {u.role === "seller" && (
                              <Link
                                href={`/admin/products?seller=${u.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-paper border border-line text-forest hover:border-forest text-xs font-semibold rounded transition-colors"
                                title="View Products by this Seller"
                              >
                                <Package size={13} /> Seller Products
                              </Link>
                            )}
                            <button
                              onClick={() => handleEditClick(u)}
                              aria-label="Edit user and access permissions"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest text-canvas text-xs font-semibold rounded hover:bg-forest/80 transition-colors"
                              title="Edit User & Access Permissions"
                            >
                              <Edit size={13} /> Edit Access
                            </button>
                            <button
                              onClick={() => handleToggleSuspendUser(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded border transition-colors ${
                                u.status === "suspended"
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                              }`}
                              title={u.status === "suspended" ? "Re-activate Account" : "Suspend Account"}
                            >
                              <ShieldAlert size={13} /> {u.status === "suspended" ? "Activate" : "Suspend"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              aria-label="Delete user"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 text-xs font-semibold rounded hover:bg-red-50 transition-colors"
                              title="Delete User Account"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- CREATE USER & ACCESS CONTROL MODAL --- */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create User & Assign Access Permissions">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">First Name</span>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
                placeholder="Sarah"
              />
            </label>
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Last Name</span>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
                placeholder="Vendor"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Email Address</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              placeholder="user@sansons.com"
            />
          </label>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              placeholder="••••••••"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Assign Role</span>
              <select
                value={roleSelect}
                onChange={(e) => setRoleSelect(e.target.value)}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              >
                {PREDEFINED_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Account Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>

          {roleSelect === "custom" && (
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-forest mb-1.5 font-medium">Enter Custom Role Name</span>
              <input
                type="text"
                required
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                className="w-full border border-forest rounded-sm px-3.5 py-2 bg-paper outline-none focus:ring-1 focus:ring-forest text-sm"
                placeholder="e.g. Content Manager, Logistics Lead"
              />
            </label>
          )}

          {/* MODULE ACCESS CONTROL CHECKBOXES */}
          {roleSelect !== "admin" && (
            <div className="border border-line rounded-sm p-4 bg-canvas/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-ink flex items-center gap-1.5">
                  <Lock size={13} className="text-forest" /> Module Access Permissions
                </span>
                <span className="text-[11px] text-ink2">Select modules this user can access</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {AVAILABLE_MODULES.map((m) => {
                  const isChecked = form.allowed_modules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleCreateModule(m.id)}
                      className={`flex items-start gap-2.5 p-2.5 border rounded-sm text-left transition-colors ${
                        isChecked ? "border-forest bg-forest/5 text-ink" : "border-line bg-paper text-ink2 hover:border-ink"
                      }`}
                    >
                      {isChecked ? <CheckSquare size={16} className="text-forest mt-0.5 shrink-0" /> : <Square size={16} className="text-ink2 mt-0.5 shrink-0" />}
                      <div>
                        <p className="text-xs font-medium">{m.label}</p>
                        <p className="text-[10px] text-ink2 line-clamp-1">{m.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User with Permissions
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT USER & ACCESS CONTROL MODAL --- */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit User & Permissions: ${selectedUser?.email}`}>
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">First Name</span>
              <input
                type="text"
                required
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Last Name</span>
              <input
                type="text"
                required
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Reset Password (Leave blank to keep current)</span>
            <input
              type="password"
              value={editForm.password || ""}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              placeholder="Enter new password if changing"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">

            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Modify Role</span>
              <select
                value={editRoleSelect}
                onChange={(e) => setEditRoleSelect(e.target.value)}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              >
                {PREDEFINED_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-ink2 mb-1.5">Status</span>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full border border-line rounded-sm px-3.5 py-2 bg-paper outline-none focus:border-forest text-sm"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
          </div>

          {editRoleSelect === "custom" && (
            <label className="block text-sm">
              <span className="block text-xs uppercase tracking-wider text-forest mb-1.5 font-medium">Enter Custom Role Name</span>
              <input
                type="text"
                required
                value={editCustomRoleInput}
                onChange={(e) => setEditCustomRoleInput(e.target.value)}
                className="w-full border border-forest rounded-sm px-3.5 py-2 bg-paper outline-none focus:ring-1 focus:ring-forest text-sm"
                placeholder="e.g. Content Manager, Logistics Lead"
              />
            </label>
          )}

          {/* MODULE ACCESS CONTROL CHECKBOXES FOR EDIT */}
          {editRoleSelect !== "admin" && (
            <div className="border border-line rounded-sm p-4 bg-canvas/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-ink flex items-center gap-1.5">
                  <Lock size={13} className="text-forest" /> Module Access Permissions
                </span>
                <span className="text-[11px] text-ink2">Select modules this user can access</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {AVAILABLE_MODULES.map((m) => {
                  const isChecked = Array.isArray(editForm?.allowed_modules) && editForm.allowed_modules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleEditModule(m.id)}
                      className={`flex items-start gap-2.5 p-2.5 border rounded-sm text-left transition-colors ${
                        isChecked ? "border-forest bg-forest/5 text-ink" : "border-line bg-paper text-ink2 hover:border-ink"
                      }`}
                    >
                      {isChecked ? <CheckSquare size={16} className="text-forest mt-0.5 shrink-0" /> : <Square size={16} className="text-ink2 mt-0.5 shrink-0" />}
                      <div>
                        <p className="text-xs font-medium">{m.label}</p>
                        <p className="text-[10px] text-ink2 line-clamp-1">{m.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes & Access Control
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminCustomersPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink2">Loading Users & Access Control...</div>}>
      <AdminCustomersPage />
    </Suspense>
  );
}
