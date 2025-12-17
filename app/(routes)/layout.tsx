import { NavigationBar } from "@/components/navigation/navigation-bar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-start w-full h-full">
      <NavigationBar />
      <div className="w-full px-8">
      {children}
      </div>
    </div>
  );
}
