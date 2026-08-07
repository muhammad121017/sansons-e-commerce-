"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate visitor session ID if not exists
    let sessionId = localStorage.getItem("visitor_session_id");
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("visitor_session_id", sessionId);
    }

    // Ignore tracking administrative panel page views
    if (pathname && pathname.startsWith("/admin")) {
      return;
    }

    const recordVisit = async () => {
      try {
        await api.post("/dashboard/visitor-activity/record/", {
          session_id: sessionId,
          page_url: pathname || "/",
          action: "page_view"
        });
      } catch (err) {
        // Fail silently in background to avoid disrupting user experience
        console.error("Traffic tracker failed to log view:", err);
      }
    };

    recordVisit();
  }, [pathname]);

  return null;
}
