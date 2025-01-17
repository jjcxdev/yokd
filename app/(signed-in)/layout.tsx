"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { MobileFooter } from "../components/MobileFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen w-full justify-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-background to-card text-white lg:px-10">
      <SidebarProvider>
        <AppSidebar />
        <div className="hidden pt-8 lg:flex lg:h-screen">
          <SidebarTrigger className="text-accent" />
        </div>
        {children}
        {/* Mobile Footer section */}
        <footer className="fixed bottom-0 w-full bg-background p-4 text-dimmed lg:hidden">
          <MobileFooter />
        </footer>
      </SidebarProvider>
    </section>
  );
}
