import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const admin = await prisma.adminUser.findUnique({
          where: { username: credentials.username as string },
        })
        if (!admin) return null
        const valid = await compare(credentials.password as string, admin.passwordHash)
        if (!valid) return null
        return {
          id: admin.id,
          name: admin.username,
          email: admin.email,
        }
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.username = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? ''
        session.user.username = (token.username as string) ?? session.user.name
      }
      return session
    },
  },
})
