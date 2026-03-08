// Auth configuration stub for NextAuth v4
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: Implement actual authentication
        if (credentials?.email) {
          return {
            id: '1',
            name: 'Test User',
            email: credentials.email,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
