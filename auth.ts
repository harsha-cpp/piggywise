import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.userType) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Check if user type matches
        if (user.userType !== credentials.userType.toUpperCase()) {
          throw new Error("Invalid user type");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.userType) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After login, redirect to appropriate dashboard
      if (url === '/dashboard') {
        const token = await this.jwt?.({ user: null, account: null, profile: null, isNewUser: false });
        if (token?.userType === 'CHILD') {
          return `${baseUrl}/dashboard/child`;
        }
        if (token?.userType === 'PARENT') {
          return `${baseUrl}/dashboard/parent`;
        }
      }
      
      // Handle dashboard redirects
      if (url.startsWith("/dashboard")) {
        return url;
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 