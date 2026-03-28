import type { NextAuthConfig } from "next-auth";

/**
 * Basic configuration for NextAuth.js.
 * This file is imported in middleware and other edge-compatible environments.
 * It SHOULD NOT import database clients or heavy server-side dependencies.
 */
export const authConfig = {
	providers: [], // Empty providers for middleware
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session: ({ session, token }) => ({
			...session,
			user: {
				...session.user,
				id: token.id as string,
			},
		}),
	},
} satisfies NextAuthConfig;
