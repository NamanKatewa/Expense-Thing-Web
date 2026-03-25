import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import { LandingContent } from "~/components/landing/landing-content";
import { UserAccountNav } from "~/components/layout/user-account-nav";
import { auth } from "~/server/auth";

export default async function LandingPage() {
	const session = await auth();

	return (
		<div className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<nav className="fixed top-0 right-0 left-0 z-50 border-black border-b-2 bg-background dark:border-white">
				<div className="mx-auto flex h-16 w-full items-center justify-between px-6">
					<Link className="flex items-center gap-3" href="/">
						<div className="brutal-shadow-sm flex h-8 w-8 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
							<Receipt className="h-4 w-4" />
						</div>
						<span className="font-bold font-serif text-2xl uppercase tracking-tight">
							ExpenseThing
						</span>
					</Link>
					<div className="flex items-center gap-6">
						{session?.user ? (
							<>
								<Link
									className="font-medium font-sans text-sm uppercase tracking-wider decoration-2 underline-offset-4 hover:underline"
									href="/dashboard"
								>
									Dashboard
								</Link>
								<UserAccountNav user={session.user} />
							</>
						) : (
							<>
								<Link
									className="font-medium font-sans text-sm uppercase tracking-wider decoration-2 underline-offset-4 hover:underline"
									href="/login"
								>
									Sign in
								</Link>
								<Link
									className="brutal-shadow-sm flex h-10 items-center gap-2 border-2 border-black bg-black px-5 font-bold font-sans text-sm text-white uppercase tracking-wider transition-all hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
									href="/register"
								>
									Get started
									<ArrowRight className="h-4 w-4" />
								</Link>
							</>
						)}
					</div>
				</div>
			</nav>

			<LandingContent />

			<footer className="border-black border-t-2 bg-background py-16 dark:border-white">
				<div className="mx-auto w-full px-6">
					<div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
								<Receipt className="h-4 w-4" />
							</div>
							<span className="font-bold font-serif text-3xl uppercase">
								ExpenseThing
							</span>
						</div>
						<p className="font-medium font-sans text-sm uppercase tracking-widest">
							© {new Date().getFullYear()} EXPENSETHING. ALL RIGHTS RESERVED.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
