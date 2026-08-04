"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    setMessage(res.message);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <Mail size={28} className="text-forest mx-auto mb-4" />
      <h1 className="font-display text-3xl mb-2">Reset Password</h1>
      <p className="text-ink2 mb-8">Enter your email and we'll send you a reset link.</p>
      {message ? (
        <p className="text-sm text-forest">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper outline-none focus:border-forest"
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      )}
      <Link href="/account/login" className="text-sm text-ink2 underline mt-6 inline-block">
        Back to sign in
      </Link>
    </div>
  );
}
