import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { CredentialsProvider } from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import WechatProvider from "next-auth/providers/wechat";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccount: false,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),

    // WeChat OAuth
    WechatProvider({
      clientId: process.env.WECHAT_APP_ID,
      clientSecret: process.env.WECHAT_APP_SECRET,
      profile(profile) {
        return {
          id: profile.openid,
          name: profile.nickname || profile.openid,
          email: profile.openid + "@wechat.local", // WeChat doesn't always provide email
          image: profile.headimgurl,
        };
      },
    }),

    // Credentials (Username/Password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            subscription: true,
            company: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("邮箱或密码错误");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("邮箱或密码错误");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
      }

      if (session) {
        token.sessionToken = session.sessionToken;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (token && session.user) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          image: token.image,
          role: token.role,
        };
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // 创建新用户时的默认订阅
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "BASIC",
          status: "TRIAL",
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天试用
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    },
    async signIn({ user, account, profile, isNewUser }) {
      if (isNewUser) {
        console.log("新用户注册:", user.email);
      }
    },
  },
};
