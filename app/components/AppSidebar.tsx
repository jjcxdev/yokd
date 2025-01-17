import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  ChartLine,
  CalendarDays,
  Settings,
  Cookie,
  Info,
  Send,
} from "lucide-react";

import YokdLogo from "@/app/favicon.svg";
import Image from "next/image";

// Menu items
const items = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    name: "Friends",
    icon: Users,
    url: "/friends",
  },
  {
    name: "Statistics",
    icon: ChartLine,
    url: "/statistics",
  },
  {
    name: "Calendar",
    icon: CalendarDays,
    url: "/calendar",
  },
  {
    name: "Settings",
    icon: Settings,
    url: "/user-settings",
  },
];

// Footeritems
const footer = [
  {
    name: "Privacy",
    url: "/privacy",
  },
  {
    name: "About",
    url: "/about",
  },
  {
    name: "Contact",
    url: "mailto:j@jjcx.dev",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex w-full flex-col items-start justify-center p-4">
        <Image
          className="rounded-md"
          src={YokdLogo}
          alt="YOKD"
          width={100}
          height={100}
        />
        <h1 className="font-helvob text-2xl uppercase">Yokd</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {footer.map((footer) => (
                <SidebarMenuItem key={footer.name}>
                  <SidebarMenuButton size="sm" className="" asChild>
                    <a href={footer.url}>
                      <span>{footer.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <p className="flex w-full justify-start p-2 text-xs text-dimmed">
                Copyright 2025 &copy; jjcx. All rights reserved.
              </p>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
