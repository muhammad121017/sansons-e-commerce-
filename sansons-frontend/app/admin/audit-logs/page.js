"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, Filter, Clock, UserCheck, Activity } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import Badge from "@/components/ui/Badge";
import api from "@/lib/api";

const MODULE_COLORS = {
  Orders: "bg-blue-100 text-blue-800 border-blue-200",
  Products: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Categories: "bg-amber-100 text-amber-800 border-amber-200",
  Users: "bg-purple-100 text-purple-800 border-purple-200",
  Auth: "bg-teal-100 text-teal-800 border-teal-200",
  CMS: "bg-pink-100 text-pink-800 border-pink-200",
  Settings: "bg-slate-100 text-slate-800 border-slate-200",
  General: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [query, setQuery] = useState("");

  const loadLogs = () => {
    setLoading(true);
    const params = moduleFilter !== "all" ? { module: moduleFilter } : {};
    api.get("dashboard/admin/audit-logs/", { params })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setLogs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLogs();
  }, [moduleFilter]);

  const filteredLogs = logs.filter((log) => {
    const q = query.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      log.module?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <AdminTopbar
        title="Admin Audit Logs & Activity Tracker"
        actions={
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 text-xs px-3.5 py-2 bg-paper border border-line rounded-sm hover:border-ink transition-colors font-medium"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Logs
          </button>
        }
      />

      <div className="p-8">
        {/* Banner Notice */}
        <div className="mb-6 bg-paper border border-line rounded-md p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-forest/10 text-forest rounded-md">
              <ShieldAlert size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Admin Portal Audit Trail</p>
              <p className="text-xs text-ink2">
                Every action (user logins, order status changes, product toggles, user role changes, CMS edits) is recorded with user identity & timestamp.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono bg-canvas2 px-3 py-1 rounded border border-line text-ink font-semibold">
              {filteredLogs.length} Action(s) Recorded
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by admin email, action, or details…"
            className="px-3 py-2 text-sm border border-line rounded-sm bg-paper outline-none focus:border-forest w-80"
          />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="border border-line rounded-sm text-sm px-3 py-2 bg-paper"
          >
            <option value="all">All Modules</option>
            <option value="Auth">🔐 User Logins &amp; Auth</option>
            <option value="Orders">Orders</option>
            <option value="Products">Products</option>
            <option value="Categories">Categories</option>
            <option value="Users">Users &amp; Access</option>
            <option value="CMS">CMS Content</option>
            <option value="Settings">Settings</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-ink2 text-sm">
            Loading activity log entries...
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-md overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Admin / Staff Member</th>
                  <th className="px-6 py-3">Module</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Details & Parameters</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-line hover:bg-canvas/50">
                    <td className="px-6 py-3.5 text-xs text-ink2 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-ink2/70" />
                        <span>{log.formattedTime || new Date(log.created_at || log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-forest shrink-0" />
                        <div>
                          <p className="font-medium text-xs text-ink">{log.user_email}</p>
                          <span className="text-[10px] text-ink2 uppercase tracking-wider font-mono">
                            Role: {log.user_role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${MODULE_COLORS[log.module] || MODULE_COLORS.General}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-xs text-ink">
                      {log.action}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-ink2 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-ink2 text-sm">
                      No activity log entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
