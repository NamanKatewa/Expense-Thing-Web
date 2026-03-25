"use client";

import { LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";

interface UserAccountNavProps {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
}

export function UserAccountNav({ user }: UserAccountNavProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="group flex items-center gap-2 outline-none">
				<div className="brutal-shadow-sm flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-black text-lg text-white transition-all group-hover:bg-white group-hover:text-black dark:border-white dark:bg-white dark:text-black dark:group-hover:bg-black dark:group-hover:text-white">
					{user.name?.[0]?.toUpperCase() ?? "U"}
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="brutal-shadow w-64 rounded-none border-2 border-black p-0 dark:border-white dark:bg-black"
			>
				<div className="flex items-center justify-start gap-4 border-black border-b-2 p-4 dark:border-white">
					<div className="flex flex-col space-y-1 font-sans leading-none">
						{user.name && (
							<p className="font-black text-lg uppercase tracking-tighter">
								{user.name}
							</p>
						)}
						{user.email && (
							<p className="w-[200px] truncate font-bold text-[10px] text-foreground/60 uppercase tracking-widest">
								{user.email}
							</p>
						)}
					</div>
				</div>
				<div className="space-y-1 p-2">
					<DropdownMenuItem className="rounded-none p-3 font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">
						<Link className="flex w-full items-center gap-3" href="/dashboard">
							<LayoutDashboard className="h-4 w-4 stroke-[3]" />
							Dashboard
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className="rounded-none p-3 font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black">
						<Link className="flex w-full items-center gap-3" href="/settings">
							<Settings className="h-4 w-4 stroke-[3]" />
							Settings
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator className="my-1 h-0.5 bg-black dark:bg-white" />
					<DropdownMenuItem className="cursor-pointer rounded-none p-3 font-black text-[#E05D36] uppercase tracking-widest focus:bg-[#E05D36] focus:text-white">
						<SignOutButton variant="dropdown" />
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
