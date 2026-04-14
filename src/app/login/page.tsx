"use client";

import ThemeSwitch from "@//components/custom/ThemeSwitch";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : authError.message
      );
      setLoading(false);
      return;
    }

    // Successful login — redirect to dashboard
    router.push("/dashboard");
    router.refresh(); // Refresh to pick up new session in middleware
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      {/* ── Left Pane: Brand & Abstract Graphic ── */}
      <div
        className="login-left-pane"
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          background: "var(--primary)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          color: "#ffffff",
        }}
      >
        {/* Clean, Modern Microsoft-style Branding */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              Maverics
            </h1>
          </div>
          <h2
            style={{
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: "-0.03em",
            }}
          >
            Accelerating <br />
            <span style={{ color: "#22d3ee" }}>Growth Pipeline</span>
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              fontWeight: 300,
              maxWidth: 400,
            }}
          >
            The definitive analytics and lead management platform for Maverics IT Services Business
            Development.
          </p>
        </div>
      </div>

      {/* ── Right Pane: Premium Form ── */}
      <div
        style={{
          flex: "0 0 520px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
          background: "var(--surface)",
        }}
      >
        {/* Theme Toggle Top Right */}
        <ThemeSwitch />

        <div
          style={{
            width: "100%",
            maxWidth: 360,
            animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <h3
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "0 0 8px 0",
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </h3>
          <p style={{ margin: "0 0 32px 0", color: "var(--text-muted)", fontSize: 14 }}>
            Enter your credentials to access the dashboard.
          </p>

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Error Message */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 4,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Input Group: Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginLeft: 2 }}>
                Work Email
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                >
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="you@ciphercru.com"
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 16px 0 42px",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.boxShadow = "inset 0 0 0 1px var(--primary)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Input Group: Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <label
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginLeft: 2 }}
                >
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                >
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 16px 0 42px",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.boxShadow = "inset 0 0 0 1px var(--primary)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 4,
                border: "none",
                background: loading || !email || !password ? "var(--border)" : "var(--primary)",
                color: loading || !email || !password ? "var(--text-muted)" : "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                marginTop: 12,
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: !loading && email && password ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!loading && email && password)
                  e.currentTarget.style.background = "var(--primary-hover)";
              }}
              onMouseLeave={(e) => {
                if (!loading && email && password)
                  e.currentTarget.style.background = "var(--primary)";
              }}
              onMouseDown={(e) => {
                if (!loading && email && password)
                  e.currentTarget.style.transform = "translateY(1px)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseUp={(e) => {
                if (!loading && email && password) e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}
          >
            &copy; {new Date().getFullYear()} Maverics IT Services. All rights reserved.
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .login-left-pane { display: none !important; }
        }
      `,
        }}
      />
    </div>
  );
}
