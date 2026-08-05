"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect") || "/account";
    router.replace(`/account/login?mode=register&redirect=${encodeURIComponent(redirect)}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-ink2">
      Loading sign up page...
    </div>
  );
}

export default function RegisterRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-sm text-ink2">Loading sign up page...</div>}>
      <RegisterRedirectInner />
    </Suspense>
  );
}

