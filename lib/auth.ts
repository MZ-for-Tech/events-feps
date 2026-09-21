import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import type { Role } from '@/lib/types'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const rawEmail = credentials?.email as string | undefined
          const rawPassword = credentials?.password as string | undefined

          if (!rawEmail || !rawPassword) {
            console.log('[Auth] Missing credentials')
            return null
          }

          const email = rawEmail.trim().toLowerCase()
          console.log('[Auth] Authorizing for email:', email)

          const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, password, role, permissions')
            .ilike('email', email)
            .single()

          if (error) {
            console.error('[Auth] Supabase query error:', error.message, error)
            return null
          }

          if (!user) {
            console.log('[Auth] User not found for email:', email)
            return null
          }

          console.log('[Auth] User found:', user.email, 'Checking password...')
          const valid = await bcrypt.compare(rawPassword, user.password)
          if (!valid) {
            console.log('[Auth] Invalid password for email:', email)
            return null
          }

          let parsedPermissions: string[] = []
          try {
            if (Array.isArray(user.permissions)) {
              parsedPermissions = user.permissions
            } else if (typeof user.permissions === 'string') {
              parsedPermissions = JSON.parse(user.permissions)
            }
          } catch {
            parsedPermissions = []
          }

          console.log('[Auth] Login successful for user:', user.email, 'Role:', user.role)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: parsedPermissions,
          }
        } catch (err) {
          console.error('[Auth] Unhandled exception in authorize:', err)
          return null
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
