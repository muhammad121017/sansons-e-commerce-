"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
const STORAGE_KEY = "sansons_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
    setHydrated(true);

    const handleTokenCleared = () => {
      setUser(null);
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
    };
    window.addEventListener('auth:token-cleared', handleTokenCleared);
    return () => window.removeEventListener('auth:token-cleared', handleTokenCleared);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [user, hydrated]);

  const login = async ({ email, password }) => {
    try {
      if (!email || !password) return { success: false, message: "Email and password are required." };
      const response = await api.post("auth/login/", { email, password });
      const data = response.data;
      if (data.access) {
        window.localStorage.setItem("access_token", data.access);
        window.localStorage.setItem("refresh_token", data.refresh);
        
        let loggedUser = data.user;
        if (!loggedUser) {
          const payload = JSON.parse(atob(data.access.split(".")[1]));
          loggedUser = {
            id: payload.id,
            name: payload.email.split("@")[0],
            email: payload.email,
            role: payload.role,
            allowed_modules: payload.allowed_modules || [],
          };
        }
        
        setUser(loggedUser);
        return { success: true };
      }
      return { success: false, message: "Failed to authenticate." };
    } catch (err) {
      console.error("Login failed:", err);
      const msg = err.response?.data?.detail || err.response?.data?.error || "Invalid email or password.";
      return { success: false, message: msg };
    }
  };

  const register = async ({ name, first_name, last_name, email, password }) => {
    try {
      if (!email || !password) return { success: false, message: "Email and password are required." };
      let fname = first_name || "";
      let lname = last_name || "";
      if (!fname && name) {
        const nameParts = name.trim().split(/\s+/);
        fname = nameParts[0] || "";
        lname = nameParts.slice(1).join(" ") || "";
      }

      await api.post("auth/register/", {
        email,
        password,
        first_name: fname,
        last_name: lname,
        role: "purchaser",
      });

      return await login({ email, password });
    } catch (err) {
      console.error("Registration failed:", err);
      const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || err.response?.data?.error || "Registration failed.";
      return { success: false, message: msg };
    }
  };


  const loginWithGoogle = async ({ email, first_name, last_name, google_id }) => {
    try {
      const response = await api.post("auth/google/", { email, first_name, last_name, google_id });
      const data = response.data;
      if (data.access) {
        window.localStorage.setItem("access_token", data.access);
        window.localStorage.setItem("refresh_token", data.refresh);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: "Google authentication failed." };
    } catch (err) {
      console.error("Google login failed:", err);
      return { success: false, message: "Google login failed." };
    }
  };

  const requestPasswordReset = async (email) => {
    return { success: true, message: `If an account exists for ${email}, a reset link has been sent.` };
  };

  const logout = () => {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, loginWithGoogle, requestPasswordReset, logout, hydrated }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
