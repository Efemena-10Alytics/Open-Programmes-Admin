"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Group,
  GraduationCap,
  CreditCard,
  BarChart3,
  UserCheck,
  PhoneCall,
  RefreshCw,
  Newspaper,
  LogOut,
  Globe,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../logo";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
  },
  {
    label: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    label: "Cohorts",
    href: "/cohort",
    icon: Group,
  },
  {
    label: "Classroom (LMS)",
    href: "/classroom",
    icon: GraduationCap,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    label: "Sales & Analytics",
    href: "/sales",
    icon: BarChart3,
  },
  {
    label: "Facilitators",
    href: "/facilitators",
    icon: UserCheck,
  },
  {
    label: "Program Leads",
    href: "/program-leads",
    icon: PhoneCall,
  },
  {
    label: "Change Requests",
    href: "/change-requests",
    icon: RefreshCw,
  },
  {
    label: "Blogs & Articles",
    href: "/blogs",
    icon: Newspaper,
  },
];

export function NavigationBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignout = async () => {
    await signOut().then(() => {
      window.location.href = "/auth/signin";
    });
  };

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "A";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col bg-white text-slate-800 border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo width={135} height={38} color="#0F172A" />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <item.icon
                  className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile / Footer Section */}
      <div className="border-t border-slate-200 p-4 bg-slate-50/50">
        <div className="flex items-center gap-3 px-1.5 py-1.5 rounded-lg">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
            {userInitial}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-xs font-semibold text-slate-800 leading-tight">
              {session?.user?.name || "Administrator"}
            </span>
            <span 
              suppressHydrationWarning
              className="truncate text-[10px] text-slate-500 mt-0.5"
            >
              {session?.user?.email}
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">

          <Button
            variant="ghost"
            onClick={handleSignout}
            className="flex-1 justify-center gap-1.5 h-8 text-xs text-red-650 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
