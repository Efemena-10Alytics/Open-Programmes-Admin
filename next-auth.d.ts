import NextAuth, { type DefaultSession } from "next-auth";
import { UserRole } from "./types";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: UserRole;
  emailVerified: Date | string | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
    accessToken: string;
  }
}
