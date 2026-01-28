import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:4000',
})

export const { signIn, signUp, useSession, signOut } = authClient
