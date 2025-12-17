import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { User, UserRole } from "@/types";
import { APIURL } from "@/utils/api-address";
import { encode, decode } from "next-auth/jwt";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${APIURL}/api/auth/signin`, credentials);
          const user = res.data.data;

          if (res.status === 200 && user) {
            return user;
          }

          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    encode: async ({ secret, token }) => {
      try {
        // console.log("Encoding token:", token);
        const encodedToken = await encode({ secret, token });
        // console.log("Encoded token:", encodedToken);
        return encodedToken;
      } catch (error) {
        console.error("JWT encode error:", error);
        throw new Error("JWT encode error");
      }
    },
    decode: async ({ secret, token }) => {
      try {
        // console.log("Decoding token:", token);
        const decodedToken = await decode({ secret, token });
        // console.log("Decoded token:", decodedToken);
        return decodedToken;
      } catch (error) {
        console.error("JWT decode error:", error);
        throw new Error("JWT decode error");
      }
    },
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "credentials") return true;

      if (account?.provider === "credentials") {
        try {
          const existingUser: User = await axios
            .get(`${APIURL}/api/users/${user.id}/no-auth`)
            .then((response) => response.data?.data);

          if (!existingUser?.emailVerified) return false;
        } catch (error) {
          console.error("SignIn error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, account }) {
      if (!token.sub) return token;

      if (account?.provider === "credentials") {
        try {
          const existingUser: User = await axios
            .get(`${APIURL}/api/users/${token.sub}/no-auth`)
            .then((response) => response.data?.data);

          if (!existingUser) return token;

          token.id = existingUser.id;
          token.name = existingUser.name;
          token.email = existingUser.email;
          token.role = existingUser.role;
          token.accessToken = existingUser.access_token;
          token.emailVerified = existingUser.emailVerified;
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }

      // console.log("Returning token from JWT callback:", token);
      return token;
    },

    async session({ session, token }) {
      // console.log("Session callback - token:", token);
      // console.log("Session callback - session before update:", session);

      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.accessToken = token.accessToken as string;
        session.user.emailVerified = token.emailVerified as Date | string | null;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
      }

      // console.log("Session callback - session after update:", session);
      return session;
    },
  },
  debug: true, // Enable this for detailed logging
};
