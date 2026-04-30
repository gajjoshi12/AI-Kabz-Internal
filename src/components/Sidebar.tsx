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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { section: "Social Media" },
  { href: "/social/linkedin-posts", label: "LinkedIn Posts", icon: Linkedin },
  { href: "/social/linkedin-outreach", label: "LinkedIn Outreach", icon: Linkedin },
  { href: "/social/instagram-posts", label: "Instagram Posts", icon: Instagram },
  { href: "/social/instagram-outreach", label: "Instagram DMs", icon: Instagram },
  { href: "/social/emails", label: "Emails", icon: Mail },
  { section: "Caller" },
  { href: "/caller/cold-calls", label: "Cold Calls", icon: Phone },
  { href: "/caller/zoom-meetings", label: "Zoom Meetings", icon: Video },
  { section: "Pipeline" },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/targets", label: "Targets", icon: Target },
  { href: "/reports", label: "Daily Reports", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { section: "Admin" },
  { href: "/employees", label: "Designations", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

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
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-brand-700">AI Kab</h1>
          <p className="text-xs text-gray-500 mt-0.5">Team Tracking System</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item, i) => {
            if ("section" in item) {
              return (
                <div
                  key={`s-${i}`}
                  className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {item.section}
                </div>
              );
            }
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
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
