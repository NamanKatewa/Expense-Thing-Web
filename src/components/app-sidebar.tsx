"use client";

import {
	Activity,
	CreditCard,
	LayoutDashboard,
	LogOut,
	Plus,
	Receipt,
	Settings,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "~/components/layout/sign-out-action";
import { Button } from "~/components/ui/button";

interface AppSidebarProps {
	session: {
		user?: {
			name?: string | null;
			email?: string | null;
		};
	};
}

const navItems = [
	{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
	{ href: "/groups", icon: Users, label: "My Groups" },
	{ href: "/settlements", icon: CreditCard, label: "Settlements" },
	{ href: "/analytics", icon: TrendingUp, label: "Analytics" },
	{ href: "/activity", icon: Activity, label: "Activity" },
];

export function AppSidebar({ session }: AppSidebarProps) {
	const pathname = usePathname();

	return (
		<aside className="hidden border-black border-r-4 bg-background text-foreground lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col dark:border-white">
			<div className="flex h-20 shrink-0 items-center gap-4 border-black border-b-4 px-6 dark:border-white">
				<Link className="flex items-center gap-3" href="/dashboard">
					<div className="brutal-shadow-sm flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
						<Receipt className="h-5 w-5" />
					</div>
					<span className="font-black font-serif text-2xl uppercase tracking-tighter">
						ExpenseThing
					</span>
				</Link>
			</div>

			<nav className="flex-1 space-y-2 px-6 py-8 font-sans">
				{navItems.map((item) => (
					<Link
						className={`flex items-center gap-4 border-2 px-4 py-4 font-black text-sm uppercase tracking-[0.2em] transition-all ${
							pathname === item.href
								? "brutal-shadow-sm border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
								: "border-transparent hover:border-black hover:bg-zinc-100 dark:hover:border-white dark:hover:bg-zinc-900"
						}`}
						href={item.href}
						key={item.href}
					>
						<item.icon className="h-5 w-5 stroke-[3]" />
						{item.label}
					</Link>
				))}
			</nav>

			<div className="space-y-4 border-black border-t-4 p-6 dark:border-white">
				<Link className="block w-full" href="/groups">
					<Button className="brutal-shadow-sm w-full justify-start gap-4 rounded-none border-4 border-black bg-[#E05D36] py-6 font-black text-black uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:border-white">
						<Plus className="h-6 w-6 stroke-[3]" />
						Add Expense
					</Button>
				</Link>
				<Link
					className="flex items-center gap-4 border-2 border-transparent px-4 py-3 font-black text-sm uppercase tracking-[0.2em] transition-all hover:border-black hover:bg-zinc-100 dark:hover:border-white dark:hover:bg-zinc-900"
					href="/settings"
				>
					<Settings className="h-5 w-5 stroke-[3]" />
					Settings
				</Link>
				<form action={signOutAction}>
					<button
						className="flex w-full items-center gap-4 border-2 border-transparent px-4 py-3 font-black text-[#E05D36] text-sm uppercase tracking-[0.2em] transition-all hover:border-[#E05D36] hover:bg-[#FFF0EB] dark:hover:bg-[#331100]"
						type="submit"
					>
						<LogOut className="h-5 w-5 stroke-[3]" />
						Sign out
					</button>
				</form>

				<div className="brutal-shadow-sm mt-6 flex items-center gap-4 border-2 border-black bg-white p-4 dark:border-white dark:bg-black">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-black font-black text-lg text-white dark:border-white dark:bg-white dark:text-black">
						{session.user?.name?.[0]?.toUpperCase() ?? "U"}
					</div>
					<div className="flex-1 overflow-hidden font-sans">
						<p className="truncate font-black text-sm uppercase tracking-tighter">
							{session.user?.name ?? "User"}
						</p>
						<p className="truncate font-bold text-xs uppercase tracking-widest opacity-60">
							{session.user?.email ?? ""}
						</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
