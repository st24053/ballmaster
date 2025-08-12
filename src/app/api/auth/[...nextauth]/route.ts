import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// This file handles authentication using NextAuth.js with Google as the provider.
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}
// This is the main handler for NextAuth.js
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      // Set user role based on email domain
      if (session.user) {
        session.user.role = token.email?.endsWith("@ormiston.school.nz") ? "admin" : "user";
      }
      return session;
    },
    async jwt({ token, account }) {
      return token;
    },
  },
});

export { handler as GET, handler as POST };