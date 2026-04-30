"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Linkedin, Instagram, Phone, Video, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — visual */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-fuchsia-600 p-12 text-white flex-col justify-between">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-fuchsia-400/20 blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-rose-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Sparkles size={20} strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">AI Kab</p>
              <p className="text-xs text-white/70 uppercase tracking-widest font-semibold">
                Team Intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-display-md font-bold tracking-tight leading-[1.05]">
              See exactly
              <br />
              who's working,
              <br />
              <span className="text-rose-200">in real time.</span>
            </h2>
            <p className="mt-5 text-base text-white/80 max-w-md leading-relaxed">
              Track every LinkedIn post, every cold call, every Zoom meeting, every lead.
              Know which of your team members is hitting their numbers — and which one isn't.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: Linkedin, label: "LinkedIn Tracking" },
              { icon: Instagram, label: "Instagram DMs" },
              { icon: Phone, label: "Cold Calls" },
              { icon: Video, label: "Zoom Meetings" },
              { icon: Users, label: "Leads Pipeline" },
              { icon: Sparkles, label: "Real-time Targets" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md"
              >
                <Icon size={15} className="text-white/90 shrink-0" />
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} AI Kab · Built for high-output teams
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white relative">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(at 80% 0%, rgba(236, 72, 153, 0.06), transparent 50%), radial-gradient(at 0% 100%, rgba(124, 58, 237, 0.05), transparent 50%)",
          }}
        />
        <div className="relative w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 flex items-center justify-center text-white shadow-glow">
              <Sparkles size={20} strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-ink-900">AI Kab</p>
              <p className="text-xs text-ink-500 uppercase tracking-widest font-semibold">
                Team Intelligence
              </p>
            </div>
          </div>

          <h1 className="text-display-sm font-bold text-ink-900 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Sign in to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-slide-down">
                {error}
              </div>
            )}
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in…" : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-100">
            <p className="text-xs text-ink-400 text-center">
              Default credentials in <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-[10px]">.env</code> ·
              change before production
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
