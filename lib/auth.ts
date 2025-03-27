// import { v4 as uuid } from "uuid";
// import { encode as defaultEncode } from "next-auth/jwt";

import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { z } from "zod";



// import { Session } from "next-auth";

// const adapter = PrismaAdapter(db);

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter,
//   providers: [
//     GitHub({
//       clientId: process.env.GITHUB_CLIENT_ID!,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//     }),
//     Credentials({
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       authorize: async (credentials) => {
//         const parsed = z
//           .object({
//             email: z.string().email(),
//             password: z.string().min(8),
//           })
//           .safeParse(credentials);

//         if (!parsed.success) return null;

//         const user = await db.user.findUnique({
//           where: { email: parsed.data.email },
//         });

//         if (!user?.password) return null;

//         const isValid = await bcrypt.compare(
//           parsed.data.password,
//           user.password
//         );
//         return isValid ? user : null;
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string; // Ensure TypeScript knows this exists
//         session.user.email = token.email as string;
//       }
//       return session as Session; // Explicitly cast to Session type
//     },
//   },
//   jwt: {
//     encode: async (params) => {
//       if (params.token?.sub) {
//         const sessionToken = uuid();
//         await db.session.create({
//           data: {
//             sessionToken,
//             userId: params.token.sub,
//             expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
//           },
//         });
//         return sessionToken;
//       }
//       return defaultEncode(params);
//     },
//     decode: async (params) => {
//       if (typeof params.token !== "string") return null;
//       const session = await db.session.findUnique({
//         where: { sessionToken: params.token },
//         include: { user: true },
//       });
//       return session?.user || null;
//     },
//   },
// });

const adapter = PrismaAdapter(db);

export const authOptions : NextAuthOptions = {
  adapter,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.password) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );
        return isValid ? user : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session as Session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
