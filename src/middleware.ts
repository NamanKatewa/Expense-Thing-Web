import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const isLoggedIn = !!req.auth;
	const isAuthPage =
		req.nextUrl.pathname.startsWith("/login") ||
		req.nextUrl.pathname.startsWith("/register");

	if (isAuthPage && isLoggedIn) {
		return Response.redirect(new URL("/dashboard", req.nextUrl));
	}
});

export const config = {
	matcher: ["/login", "/register"],
};
