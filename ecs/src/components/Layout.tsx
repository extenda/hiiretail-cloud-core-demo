import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-canvas">
          <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
