import { NavigationBar } from "@/components/navigation/navigation-bar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-start w-full h-full min-h-screen">
      <NavigationBar />
      <div className="w-full pl-64 px-8 py-6 bg-slate-50 min-h-screen">
      {children}
      </div>
    </div>
  );
}
