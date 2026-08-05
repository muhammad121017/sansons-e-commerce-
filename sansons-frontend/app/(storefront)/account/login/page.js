"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

function StorefrontAuthPageInner() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const redirectTarget = searchParams.get("redirect") || "/account";

  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle, isAuthenticated, hydrated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "60165557205-2avhk0lr636jviob6rb2hri0cijnka7r.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handle Google OAuth hash callback redirect if applicable
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setLoading(true);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then((res) => res.json())
          .then(async (googleUser) => {
            if (googleUser && googleUser.email) {
              const res = await loginWithGoogle({
                email: googleUser.email,
                first_name: googleUser.given_name || googleUser.name || "",
                last_name: googleUser.family_name || "",
                google_id: googleUser.sub || googleUser.id || ""
              });
              setLoading(false);
              if (res.success) {
                showToast(`Welcome ${googleUser.name || googleUser.email}! Logged in with Google.`, "success");
                window.history.replaceState(null, "", window.location.pathname);
                router.push(redirectTarget);
              } else {
                showToast(res.message, "error");
              }
            } else {
              setLoading(false);
            }
          })
          .catch(() => setLoading(false));
      }
    }
  }, [redirectTarget, router, showToast]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.push(redirectTarget);
    }
  }, [hydrated, isAuthenticated, redirectTarget, router]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showToast("Please fill in both email and password.", "error");
      return;
    }
    setLoading(true);
    const res = await login({ email: loginForm.email, password: loginForm.password });
    setLoading(false);
    if (res.success) {
      showToast("Welcome back to Sansons!", "success");
      router.push(redirectTarget);
    } else {
      showToast(res.message, "error");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.password) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setLoading(true);
    const res = await register({
      first_name: registerForm.firstName,
      last_name: registerForm.lastName,
      email: registerForm.email,
      password: registerForm.password
    });
    setLoading(false);
    if (res.success) {
      showToast("Account created successfully! Welcome to Sansons.", "success");
      router.push(redirectTarget);
    } else {
      showToast(res.message, "error");
    }
  };

  const handleGoogleAuth = () => {
    if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              setLoading(true);
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const googleUser = await userInfoRes.json();
              if (googleUser && googleUser.email) {
                const res = await loginWithGoogle({
                  email: googleUser.email,
                  first_name: googleUser.given_name || googleUser.name || "",
                  last_name: googleUser.family_name || "",
                  google_id: googleUser.sub || googleUser.id || ""
                });
                setLoading(false);
                if (res.success) {
                  showToast(`Welcome ${googleUser.name || googleUser.email}! Logged in with Google.`, "success");
                  router.push(redirectTarget);
                } else {
                  showToast(res.message, "error");
                }
              } else {
                setLoading(false);
                showToast("Failed to retrieve Google user profile.", "error");
              }
            } catch (err) {
              setLoading(false);
              showToast("Google authentication error.", "error");
            }
          }
        }
      });
      client.requestAccessToken();
    } else {
      const redirectUri = encodeURIComponent(window.location.origin + "/account/login");
      const scope = encodeURIComponent("openid profile email");
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
    }
  };



  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-canvas">
      <div className="w-full max-w-md bg-paper border border-line rounded-lg shadow-lift p-8">
        {/* Banner notice if redirected from checkout */}
        {redirectTarget.includes("checkout") && (
          <div className="mb-6 bg-forest/10 border border-forest/30 text-forest rounded-md p-3.5 text-xs flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Please sign in or create an account to place your order.</span>
          </div>
        )}

        {/* Header Tabs */}
        <div className="flex border-b border-line mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-center text-sm font-medium tracking-wide uppercase transition-colors relative ${
              mode === "login" ? "text-forest font-semibold" : "text-ink2 hover:text-ink"
            }`}
          >
            Sign In
            {mode === "login" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest" />}
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-3 text-center text-sm font-medium tracking-wide uppercase transition-colors relative ${
              mode === "register" ? "text-forest font-semibold" : "text-ink2 hover:text-ink"
            }`}
          >
            Create Account
            {mode === "register" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest" />}
          </button>
        </div>

        {/* SIGN IN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink2 mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink2" />
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full border border-line rounded-sm pl-10 pr-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-ink2 font-medium">Password</label>
                <Link href="/account/forgot-password" className="text-xs text-ink2 hover:text-forest underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink2" />
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-line rounded-sm pl-10 pr-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2 py-3" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink2 mb-1.5 font-medium">First Name</label>
                <input
                  type="text"
                  required
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  placeholder="Jane"
                  className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink2 mb-1.5 font-medium">Last Name</label>
                <input
                  type="text"
                  required
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink2 mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink2" />
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full border border-line rounded-sm pl-10 pr-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink2 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full border border-line rounded-sm pl-10 pr-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink2 mb-1.5 font-medium">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink2" />
                <input
                  type="password"
                  required
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full border border-line rounded-sm pl-10 pr-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2 py-3" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        )}

        {/* OR DIVIDER */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <span className="relative bg-paper px-3 text-xs uppercase tracking-wider text-ink2">
            Or Continue With
          </span>
        </div>

        {/* GOOGLE AUTH BUTTON */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full border border-line rounded-sm py-3 px-4 flex items-center justify-center gap-3 text-sm font-medium bg-canvas hover:bg-canvas2 hover:border-ink transition-all shadow-sm group"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-ink group-hover:text-forest transition-colors">
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </span>
        </button>

        <p className="text-xs text-ink2 mt-6 text-center leading-relaxed">
          By continuing, you agree to Sansons' Terms of Service and Privacy Policy. All accounts are secured with SSL encryption.
        </p>
      </div>
    </div>
  );
}

export default function StorefrontAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center text-sm text-ink2">Loading...</div>}>
      <StorefrontAuthPageInner />
    </Suspense>
  );
}
