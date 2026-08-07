"use client";

import { useEffect, useState } from "react";
import { Users, Eye, Monitor, Clock, RefreshCw, AlertCircle, Globe } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminUI";
import api from "@/lib/api";

export default function AdminVisitorLogsPage() {
  const [data, setData] = useState({
    total_views_today: 0,
    unique_sessions_today: 0,
    registered_count_today: 0,
    logs: []
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // "all" | "registered" | "guests"
  const [query, setQuery] = useState("");

  const loadLogs = () => {
    setLoading(true);
    api.get("dashboard/admin/visitor-activity/logs/")
      .then((res) => {
        setData(res.data || {
          total_views_today: 0,
          unique_sessions_today: 0,
          registered_count_today: 0,
          logs: []
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = (data.logs || []).filter((log) => {
    // Search query matching
    const q = query.toLowerCase();
    const matchesSearch = 
      (log.user_email || "").toLowerCase().includes(q) ||
      (log.page_url || "").toLowerCase().includes(q) ||
      (log.ip_address || "").toLowerCase().includes(q) ||
      (log.user_agent || "").toLowerCase().includes(q);

    // Filter type matching
    if (filterType === "registered") {
      return matchesSearch && log.user_email && log.user_email !== "Guest";
    }
    if (filterType === "guests") {
      return matchesSearch && (!log.user_email || log.user_email === "Guest");
    }
    return matchesSearch;
  });

  const getCleanUserAgent = (ua) => {
    if (!ua) return "Unknown Browser";
    if (ua.includes("Firefox/")) return "Mozilla Firefox";
    if (ua.includes("Chrome/") && ua.includes("Safari/")) return "Google Chrome / Chromium";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Apple Safari";
    if (ua.includes("Edge/")) return "Microsoft Edge";
    return ua.length > 35 ? ua.substring(0, 35) + "..." : ua;
  };

  return (
    <div>
      <AdminTopbar
        title="Store Traffic & Visitor Logs"
        actions={
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 text-xs px-3.5 py-2 bg-paper border border-line rounded-sm hover:border-ink transition-colors font-medium"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Traffic Data
          </button>
        }
      />

      <div className="p-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-paper border border-line rounded-md p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink2 uppercase tracking-wider">Total Page Views Today</p>
              <h3 className="text-3xl font-display font-semibold text-ink mt-1.5">{data.total_views_today}</h3>
              <p className="text-xs text-forest mt-1">Hits logged across storefront pages</p>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
              <Eye size={24} />
            </div>
          </div>

          <div className="bg-paper border border-line rounded-md p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink2 uppercase tracking-wider">Unique Guest Sessions</p>
              <h3 className="text-3xl font-display font-semibold text-ink mt-1.5">{data.unique_sessions_today}</h3>
              <p className="text-xs text-ink2 mt-1">Anonymous browsers tracked today</p>
            </div>
            <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
              <Globe size={24} />
            </div>
          </div>

          <div className="bg-paper border border-line rounded-md p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink2 uppercase tracking-wider">Registered Accounts Visiting</p>
              <h3 className="text-3xl font-display font-semibold text-ink mt-1.5">{data.registered_count_today}</h3>
              <p className="text-xs text-forest mt-1">Unique customer logins active today</p>
            </div>
            <div className="p-4 bg-forest/10 text-forest rounded-full">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap items-center justify-between">
          <div className="flex gap-3 items-center flex-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by IP, URL, email, or browser..."
              className="px-3 py-2 text-sm border border-line rounded-sm bg-paper outline-none focus:border-forest w-80"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-line rounded-sm text-sm px-3 py-2 bg-paper"
            >
              <option value="all">All Visitors</option>
              <option value="registered">Registered Accounts Only</option>
              <option value="guests">Guest/Anonymous Only</option>
            </select>
          </div>
          <div className="text-xs text-ink2 bg-canvas2 border border-line px-3 py-1.5 rounded-sm font-mono font-medium">
            {filteredLogs.length} Active Records Filtered
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="text-center py-12 text-ink2 text-sm">
            Loading storefront visitor logs...
          </div>
        ) : (
          <div className="bg-paper border border-line rounded-md overflow-x-auto shadow-sm">
            <table className="w-full text-sm min-w-[950px]">
              <thead>
                <tr className="text-left text-ink2 text-xs uppercase bg-canvas2">
                  <th className="px-6 py-3 w-48">Timestamp</th>
                  <th className="px-6 py-3 w-64">Visitor Account</th>
                  <th className="px-6 py-3 w-40">Session Key</th>
                  <th className="px-6 py-3">Page Visited</th>
                  <th className="px-6 py-3 w-64">Browser Agent</th>
                  <th className="px-6 py-3 w-40">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const isGuest = !log.user_email || log.user_email === "Guest";
                  return (
                    <tr key={log.id} className="border-t border-line hover:bg-canvas/50">
                      <td className="px-6 py-3.5 text-xs text-ink2 whitespace-nowrap font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-ink2/70" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                              isGuest
                                ? "bg-slate-100 text-slate-800 border-slate-200"
                                : "bg-forest/10 text-forest border-forest/20"
                            }`}
                          >
                            {isGuest ? "Guest" : "Customer"}
                          </span>
                          <span className="text-xs font-medium text-ink truncate w-40 block" title={log.user_email}>
                            {log.user_email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono text-ink2">
                        {log.session_id ? log.session_id.substring(0, 12) + "..." : "No Session"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-canvas border border-line text-ink font-medium">
                          {log.page_url}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-ink2 font-medium" title={log.user_agent}>
                        <div className="flex items-center gap-1.5">
                          <Monitor size={13} className="text-ink2/60 shrink-0" />
                          <span className="truncate block w-48">{getCleanUserAgent(log.user_agent)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-ink2 font-mono">
                        {log.ip_address || "Unknown"}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-ink2 text-sm">
                      <div className="flex flex-col items-center gap-1.5">
                        <AlertCircle size={20} className="text-ink2/60" />
                        <span>No visitor activity logs found.</span>
                      </div>
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
