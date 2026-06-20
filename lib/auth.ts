import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { Role } from '@/lib/types'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Authorize called with:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user) {
          console.log('[Auth] User not found');
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!valid) {
          console.log('[Auth] Invalid password');
          return null;
        }

        console.log('[Auth] Success for user:', user.email);
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          permissions: (user as unknown as { permissions?: string | null }).permissions ? JSON.parse((user as unknown as { permissions: string }).permissions) : []
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: Role }).role
        token.id = user.id
        token.permissions = (user as { permissions?: string[] }).permissions
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role
        session.user.id = token.id as string
        Object.assign(session.user, { permissions: (token.permissions as string[]) || [] })
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
