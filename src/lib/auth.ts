import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: '아이디', type: 'text' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials, req) {
        const ip = (req?.headers?.['x-forwarded-for'] as string || '').split(',')[0].trim();
        const userAgent = ((req?.headers?.['user-agent'] as string) || '').slice(0, 300);
        const log = (username: string, role: string, action: string) =>
          prisma.accessLog.create({ data: { username, role, action, ip, userAgent } }).catch(() => {});

        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.adminUser.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.isActive) {
          if (user) await log(user.username, user.role, 'login_fail');
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          await log(user.username, user.role, 'login_fail');
          return null;
        }

        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        await log(user.username, user.role, 'login');

        return {
          id: user.id,
          name: user.username,
          email: user.role,
          image: user.clinicId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
        token.role = user.email;
        token.clinicId = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        username: token.username as string,
        role: token.role as string,
        clinicId: (token.clinicId as string) || null,
      } as any;
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
