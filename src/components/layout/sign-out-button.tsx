"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { signOutAction } from "./sign-out-action";

interface SignOutButtonProps {
	variant?: "sidebar" | "dropdown";
}

export function SignOutButton({ variant = "sidebar" }: SignOutButtonProps) {
	const queryClient = useQueryClient();

	const handleSignOut = async (e?: React.FormEvent | React.MouseEvent) => {
		if (e) {
			if ("preventDefault" in e) e.preventDefault();
		}

		// Aggressively clear all TanStack Query caches
		queryClient.clear();

		// Optional: Clear any other persistent client-side state if you have any
		localStorage.clear();
		sessionStorage.clear();

		await signOutAction();
	};

	if (variant === "dropdown") {
		return (
			<div
				className="flex w-full cursor-pointer items-center gap-3 font-black text-[#E05D36] uppercase tracking-widest"
				onClick={handleSignOut}
			>
				<LogOut className="h-4 w-4 stroke-[3]" />
				Sign out
			</div>
		);
	}

	return (
		<button
			className="flex w-full items-center gap-3 border-2 border-transparent px-4 py-3 font-bold text-[#E05D36] text-sm uppercase tracking-wider transition-colors hover:border-[#E05D36] hover:bg-[#FFF0EB] dark:hover:bg-[#331100]"
			onClick={handleSignOut}
			type="button"
		>
			<LogOut className="h-5 w-5" />
			Sign out
		</button>
	);
}
