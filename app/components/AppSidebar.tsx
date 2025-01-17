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
import X from "@/app/icons/x-logo.svg";
import Github from "@/app/icons/github-logo.svg";

// Menu items
const items = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    name: "Friends **Coming Soon**",
    icon: Users,
    url: "/friends",
  },
  {
    name: "Statistics **Coming Soon**",
    icon: ChartLine,
    url: "/statistics",
  },
  {
    name: "Calendar **Coming Soon**",
    icon: CalendarDays,
    url: "/calendar",
  },
  {
    name: "Settings **Coming Soon** ",
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

const social = [
  {
    name: "X",
    icon: X,
    url: "https://x.com/jjcx___",
  },
  {
    name: "GitHub",
    icon: Github,
    url: "https://github.com/jjcxdev/yokd ",
  },
];
export function AppSidebar() {
  const isComingSoon = (name: string) => name.includes("**Coming Soon**");
  const formatItemName = (name: string) => name.replace("**Coming Soon**", "");

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
              {items.map((item) => {
                const coming = isComingSoon(item.name);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      disabled={coming}
                      className={coming ? "cursor-not-allowed opacity-50" : ""}
                      asChild
                    >
                      <a
                        href={coming ? "#" : item.url}
                        className={`flex items-center gap-2 ${coming ? "pointer-events-none text-gray-400" : ""}`}
                        onClick={coming ? (e) => e.preventDefault() : undefined}
                      >
                        <item.icon className={coming ? "opacity-50" : ""} />
                        <span>{formatItemName(item.name)}</span>
                        {coming && (
                          <span className="rounded-full bg-gray-800 px-2 py-[0.5] text-[8px] text-gray-200">
                            Coming Soon
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
              <div className="flex gap-2 pl-2 pt-2">
                {social.map((social) => (
                  <SidebarMenuItem key={social.name}>
                    <button>
                      <a href={social.url}>
                        <Image
                          src={social.icon}
                          alt={social.name}
                          width={16}
                          height={16}
                          className="hover:fill-accent"
                        />
                      </a>
                    </button>
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
