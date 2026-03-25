import "~/styles/globals.css";

import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "ExpenseThing - Split Expenses",
	description: "Track, split, and settle expenses effortlessly.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const instrumentSerif = Instrument_Serif({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-instrument-serif",
});

const bricolage = Bricolage_Grotesque({
	subsets: ["latin"],
	variable: "--font-bricolage",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={`${instrumentSerif.variable} ${bricolage.variable}`}
			lang="en"
		>
			<body>
				<SessionProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
