import { redirect } from "next/navigation";
import { Sidebar } from "~/components/layout/sidebar";
import { auth } from "~/server/auth";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen bg-background font-sans text-foreground selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<Sidebar session={session} />
			<main className="max-w-[1600px] px-6 pt-8 pb-12 lg:px-16 lg:pl-80">
				{children}
			</main>
		</div>
	);
}
