"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  Video,
  Users,
  Target,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, group: "main" },
  { href: "/leads", label: "Leads Pipeline", icon: Users, group: "main" },

  { href: "/social/linkedin-posts", label: "LinkedIn Posts", icon: Linkedin, group: "social" },
  { href: "/social/linkedin-outreach", label: "LinkedIn Outreach", icon: Linkedin, group: "social" },
  { href: "/social/instagram-posts", label: "Instagram Posts", icon: Instagram, group: "social" },
  { href: "/social/instagram-outreach", label: "Instagram DMs", icon: Instagram, group: "social" },
  { href: "/social/emails", label: "Emails", icon: Mail, group: "social" },

  { href: "/caller/cold-calls", label: "Cold Calls", icon: Phone, group: "caller" },
  { href: "/caller/zoom-meetings", label: "Zoom Meetings", icon: Video, group: "caller" },

  { href: "/targets", label: "Targets", icon: Target, group: "manage" },
  { href: "/reports", label: "Daily Reports", icon: FileText, group: "manage" },
  { href: "/employees", label: "Designations", icon: Briefcase, group: "manage" },
  { href: "/settings", label: "Settings", icon: Settings, group: "manage" },
];

const GROUPS = [
  { id: "main", label: "Overview" },
  { id: "social", label: "Social Media" },
  { id: "caller", label: "Cold Caller" },
  { id: "manage", label: "Manage" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/90 backdrop-blur border border-ink-200 shadow-soft"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-72 flex flex-col z-40 transform transition-transform duration-300 ease-out md:translate-x-0",
          "bg-white/85 backdrop-blur-2xl border-r border-ink-200/70",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-ink-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-fuchsia-500 to-rose-500 flex items-center justify-center shadow-glow">
                <Sparkles size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 blur-md opacity-40 -z-10" />
            </div>
            <div>
              <h1 className="text-base font-bold text-ink-900 tracking-tight">AI Kab</h1>
              <p className="text-[10px] text-ink-500 uppercase tracking-widest font-semibold">
                Team Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {GROUPS.map((g) => {
            const items = NAV.filter((n) => n.group === g.id);
            return (
              <div key={g.id}>
                <div className="px-3 pb-2 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  {g.label}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative",
                          active
                            ? "bg-gradient-to-r from-brand-50 to-fuchsia-50/40 text-brand-700 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.12)]"
                            : "text-ink-600 hover:bg-ink-100/70 hover:text-ink-900"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-brand-500 to-fuchsia-500 rounded-r-full" />
                        )}
                        <Icon
                          size={17}
                          className={cn(
                            "flex-shrink-0 transition-colors",
                            active ? "text-brand-600" : "text-ink-400 group-hover:text-ink-700"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-ink-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 transition-colors group cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold shadow-soft">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-900 truncate">Admin</p>
              <p className="text-xs text-ink-500 truncate">Owner</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-ink-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
