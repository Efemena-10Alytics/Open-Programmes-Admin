"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import axios from "axios";
import { APIURL } from "@/utils/api-address";
import { setAuthToken } from "@/utils/axios";
const LoginSchema = z.object({
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
  password: z.string().min(7, {}),
});

export function LoginForm() {
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`${APIURL}/api/auth/signin`, values);
      const data = response?.data?.data;
      const token = data?.access_token;
      if (token) {
        // Set cookie for server-side session
        const sessionObj = JSON.stringify({ accessToken: token, user: {} });
        document.cookie = `admin_session=${encodeURIComponent(sessionObj)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        setAuthToken(token);
        toast.success("Signin Successful!");
        return (window.location.href = "/dashboard");
      }
      // If we reach here, authentication failed (invalid credentials or user not found)
      toast.error("Invalid email or password. Please try again.");
    } catch (error: unknown) {
      console.error("[AUTH] axios signIn error:", error);
      // Axios error may have a response with status 401/403
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error("Invalid Credentials.");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <Card className="w-full max-w-md bg-white/70 backdrop-blur-md border border-slate-100/80 shadow-xl shadow-purple-100/30 rounded-2xl p-2 md:p-4">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          Enter your administrator credentials to access your console.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="grid gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isProcessing}
                      placeholder="admin@10alytics.com"
                      type="email"
                      className="h-11 px-4 border-slate-200/80 rounded-xl focus-visible:ring-purple-600 focus-visible:border-purple-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isProcessing}
                      placeholder="••••••••"
                      type="password"
                      className="h-11 px-4 border-slate-200/80 rounded-xl focus-visible:ring-purple-600 focus-visible:border-purple-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              size="lg"
              disabled={isProcessing}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-xl shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all duration-200 mt-2 hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              {isProcessing ? "Signing In..." : "Sign In"}
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
