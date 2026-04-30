import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <Sidebar />
      <main className="md:pl-64">
        <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
