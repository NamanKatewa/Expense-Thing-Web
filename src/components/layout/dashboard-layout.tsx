import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
	children: React.ReactNode;
	session: {
		user?: {
			name?: string | null;
			email?: string | null;
		};
	};
}

export function DashboardLayout({ children, session }: DashboardLayoutProps) {
	return (
		<div className="relative flex min-h-screen w-full bg-background font-sans text-foreground selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<Sidebar session={session} />
			<div className="flex flex-1 flex-col lg:pl-72">
				<main className="min-w-0 max-w-400 flex-1 bg-background px-6 pt-8 pb-12 lg:px-16">
					{children}
				</main>
			</div>
		</div>
	);
}
