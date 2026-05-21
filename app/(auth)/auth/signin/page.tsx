import { LoginForm } from "../(components)/auth-form";
import { Logo } from "@/components/logo";

export default async function AuthPage() {
  // Just render the login form - don't redirect here
  // Middleware will handle redirects if session exists

  return (
    <div className="relative w-full min-h-screen bg-white text-slate-900 overflow-hidden font-sans flex flex-col">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff_1px,transparent_1px),linear-gradient(to_bottom,#f3e8ff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute -top-[20%] left-[10%] right-[10%] h-[40%] rounded-full bg-gradient-to-br from-purple-400/10 to-indigo-400/5 blur-[120px] pointer-events-none" />

      {/* Header / Logo */}
      <header className="relative z-10 max-w-[1600px] w-full mx-auto px-8 lg:px-20 py-6">
        <Logo width={140} height={38} color="#0A0719" />
      </header>

      {/* Login Card Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <LoginForm />
      </div>
    </div>
  );
}
