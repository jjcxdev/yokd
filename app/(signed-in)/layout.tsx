"use client";

import { MobileFooter } from "../components/MobileFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen w-full justify-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-background to-card text-white md:px-10">
      {children}
      {/* Mobile Footer section */}
      <footer className="fixed bottom-0 w-full bg-background p-4 text-dimmed md:hidden">
        <MobileFooter />
      </footer>
    </section>
  );
}
