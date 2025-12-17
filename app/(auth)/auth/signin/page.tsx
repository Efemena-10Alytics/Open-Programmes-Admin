import { getServerSession } from "next-auth";
import { LoginForm } from "../(components)/auth-form";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function AuthPage() {

  const session = await getServerSession(options);

  if (session?.accessToken) {
    return redirect("/");
  }

  return (
    <div className="w-full min-h-screen h-full pt-4 lg:pt-4">
    <span className="text-2xl font-semibold mx-8 lg:mx-20">
      NEBIANT
    </span>
    <div className="h-full flex items-center justify-center mt-36 lg:mt-20">
      <LoginForm />
    </div>
    </div>
  );
};

