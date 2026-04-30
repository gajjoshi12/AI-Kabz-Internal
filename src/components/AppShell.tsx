import { Suspense } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen app-bg">
      <Sidebar />
      <main className="md:pl-72">
        <div className="px-4 md:px-10 py-6 md:py-10 max-w-[1500px] animate-fade-in">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
