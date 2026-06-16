import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "./db/schema";
import Resend from "next-auth/providers/resend";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    signIn: ({ user }) => {
      // Regla crítica: solo correos UNSA
      if (user.email?.endsWith("@unsa.edu.pe")) return true;
      return false; 
    },
  },
});
