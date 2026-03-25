"use client";

import {
	Activity,
	CreditCard,
	LayoutDashboard,
	Menu,
	Plus,
	Receipt,
	Settings,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { SignOutButton } from "./sign-out-button";

interface SidebarProps {
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

function SidebarContent({ pathname }: { pathname: string }) {
	return (
		<>
			<nav className="flex-1 space-y-2 px-6 py-6 font-sans">
				{navItems.map((item) => (
					<Link
						className={`flex items-center gap-3 border-2 px-4 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
							pathname === item.href
								? "brutal-shadow-sm border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
								: "border-transparent text-foreground hover:border-black hover:bg-[#F0F0F0] dark:hover:border-white dark:hover:bg-[#222]"
						}`}
						href={item.href}
						key={item.href}
					>
						<item.icon className="h-5 w-5" />
						{item.label}
					</Link>
				))}
			</nav>

			<div className="space-y-4 border-black border-t-2 p-6 dark:border-white">
				<Link className="block w-full" href="/groups">
					<Button className="brutal-shadow-sm h-12 w-full justify-start gap-3 border-2 border-black bg-[#E05D36] font-bold text-black uppercase tracking-wider hover:bg-black hover:text-white dark:border-white">
						<Plus className="h-5 w-5" />
						Add Expense
					</Button>
				</Link>
				<Link
					className="flex items-center gap-3 border-2 border-transparent px-4 py-3 font-bold text-foreground text-sm uppercase tracking-wider transition-colors hover:border-black hover:bg-[#F0F0F0] dark:hover:border-white dark:hover:bg-[#222]"
					href="/settings"
				>
					<Settings className="h-5 w-5" />
					Settings
				</Link>
				<SignOutButton variant="sidebar" />
			</div>
		</>
	);
}

function SidebarFooter({ session }: { session: SidebarProps["session"] }) {
	return (
		<div className="brutal-shadow-sm mt-4 flex items-center gap-4 border-2 border-black bg-white px-4 py-3 dark:border-white dark:bg-black">
			<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-bold text-lg text-white dark:border-white dark:bg-white dark:text-black">
				{session.user?.name?.[0]?.toUpperCase() ?? "U"}
			</div>
			<div className="flex-1 overflow-hidden font-sans">
				<p className="truncate font-bold text-foreground text-sm uppercase tracking-wider">
					{session.user?.name ?? "User"}
				</p>
				<p className="truncate font-medium text-foreground/70 text-xs uppercase tracking-widest">
					{session.user?.email ?? ""}
				</p>
			</div>
		</div>
	);
}

export function Sidebar({ session }: SidebarProps) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	return (
		<>
			<aside className="hidden border-black border-r-2 bg-background text-foreground lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col dark:border-white">
				<div className="flex h-20 shrink-0 items-center gap-4 border-black border-b-2 px-6 dark:border-white">
					<Link className="flex items-center gap-3" href="/dashboard">
						<div className="brutal-shadow-sm flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
							<Receipt className="h-5 w-5" />
						</div>
						<span className="font-bold font-serif text-2xl text-foreground uppercase tracking-tight">
							ExpenseThing
						</span>
					</Link>
				</div>

				<SidebarContent pathname={pathname} />

				<div className="mt-auto p-6">
					<SidebarFooter session={session} />
				</div>
			</aside>

			<header className="flex h-20 items-center justify-between border-black border-b-2 bg-background px-6 lg:hidden dark:border-white">
				<Link className="flex items-center gap-3" href="/dashboard">
					<div className="brutal-shadow-sm flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
						<Receipt className="h-5 w-5" />
					</div>
					<span className="font-bold font-serif text-2xl text-foreground uppercase tracking-tight">
						ExpenseThing
					</span>
				</Link>
				<Button
					className="rounded-none border-2 border-transparent hover:border-black"
					onClick={() => setOpen(true)}
					size="icon"
					variant="ghost"
				>
					<Menu className="h-6 w-6" />
				</Button>
			</header>

			<Sheet onOpenChange={setOpen} open={open}>
				<SheetContent
					className="w-80 rounded-none border-black border-l-2 p-0 dark:border-white"
					side="left"
				>
					<aside className="flex h-full flex-col bg-background text-foreground">
						<div className="flex h-20 shrink-0 items-center gap-3 border-black border-b-2 px-6 dark:border-white">
							<Link className="flex items-center gap-3" href="/dashboard">
								<div className="brutal-shadow-sm flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
									<Receipt className="h-5 w-5" />
								</div>
								<span className="font-bold font-serif text-2xl text-foreground uppercase tracking-tight">
									ExpenseThing
								</span>
							</Link>
						</div>

						<SidebarContent pathname={pathname} />

						<div className="mt-auto p-6">
							<SidebarFooter session={session} />
						</div>
					</aside>
				</SheetContent>
			</Sheet>
		</>
	);
}
