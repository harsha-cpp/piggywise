import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    userType: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: string;
  }
} 