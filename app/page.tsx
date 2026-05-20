import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LogIn, 
  ArrowRight, 
  BookOpen, 
  Users, 
  CreditCard, 
  Newspaper,
  ShieldCheck
} from "lucide-react";
import { Logo } from "@/components/logo";

export default async function LandingPage() {
  const session = await getServerSession();

  // If already logged in, redirect straight to the dashboard
  if (session?.accessToken) {
    return redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-white text-slate-900 overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff_1px,transparent_1px),linear-gradient(to_bottom,#f3e8ff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute -top-[20%] left-[10%] right-[10%] h-[50%] rounded-full bg-gradient-to-br from-purple-400/10 to-indigo-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[30%] rounded-full bg-purple-300/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-[1600px] w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-100/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Logo width={140} height={38} color="#0A0719" />
        </div>
        <Link 
          href="/auth/signin" 
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-purple-50 text-purple-700 font-semibold border border-purple-100 hover:border-purple-200 rounded-xl transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign In
        </Link>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-6xl mx-auto my-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-700 mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
          </span>
          Platform Administrator Console
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-purple-600 leading-tight max-w-4xl">
          Welcome to 10alytics Admin
        </h1>

        <p className="text-base md:text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Manage courses, oversee cohort operations, review change requests, monitor payments, and handle facilitators from a unified premium console.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/auth/signin"
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:translate-y-[-2px] active:translate-y-[0px] transition-all duration-200"
          >
            <LogIn className="h-5 w-5" />
            <span>Access Dashboard</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="bg-white/60 backdrop-blur-md border border-slate-100 hover:border-purple-200 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/20 hover:-translate-y-1 group">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1.5 group-hover:text-purple-750 transition-colors duration-300">LMS & Curriculum</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Design tracks, upload training resources, and organize course syllabus modules.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/60 backdrop-blur-md border border-slate-100 hover:border-purple-200 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/20 hover:-translate-y-1 group">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1.5 group-hover:text-purple-750 transition-colors duration-300">Cohorts & Members</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Oversee cohort operations, handle student registrations, and view enrollments.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/60 backdrop-blur-md border border-slate-100 hover:border-purple-200 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/20 hover:-translate-y-1 group">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1.5 group-hover:text-purple-750 transition-colors duration-300">Audit & Payments</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Track incoming payments, authorize change requests, and check logs.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/60 backdrop-blur-md border border-slate-100 hover:border-purple-200 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/20 hover:-translate-y-1 group">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Newspaper className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1.5 group-hover:text-purple-750 transition-colors duration-300">Blogs & Articles</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Create engaging blog posts, manage newsletters, and update announcements.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-[1600px] w-full mx-auto px-6 py-6 text-center text-xs text-slate-400 border-t border-slate-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <ShieldCheck className="h-4 w-4 text-purple-650" />
          <span>AES-256 SSL Encrypted Administrator Portal</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} 10alytics. All rights reserved. Secured administrator access.
        </div>
      </footer>
    </div>
  );
}
