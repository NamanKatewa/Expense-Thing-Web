"use client";

import { Clock } from "lucide-react";
import { api } from "~/trpc/react";

function _getInitials(name: string | null | undefined) {
	if (!name) return "U";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

function getActivityLabel(type: string) {
	const labels: Record<string, string> = {
		EXPENSE_CREATED: "ADDED AN EXPENSE",
		EXPENSE_EDITED: "EDITED AN EXPENSE",
		EXPENSE_DELETED: "DELETED AN EXPENSE",
		SETTLEMENT_CREATED: "RECORDED A SETTLEMENT",
		SETTLEMENT_DELETED: "DELETED A SETTLEMENT",
		MEMBER_JOINED: "JOINED THE GROUP",
		MEMBER_LEFT: "LEFT THE GROUP",
		GROUP_CREATED: "CREATED A GROUP",
		GROUP_DELETED: "DELETED A GROUP",
	};
	return labels[type] || "DID SOMETHING";
}

function getActivityIcon(type: string) {
	const icons: Record<string, string> = {
		EXPENSE_CREATED: "💰",
		EXPENSE_EDITED: "✏️",
		EXPENSE_DELETED: "🗑️",
		SETTLEMENT_CREATED: "🤝",
		SETTLEMENT_DELETED: "🔥",
		MEMBER_JOINED: "👋",
		MEMBER_LEFT: "👋",
		GROUP_CREATED: "✨",
		GROUP_DELETED: "💥",
	};
	return icons[type] || "•";
}

function formatTimeAgo(date: Date | string) {
	const now = new Date();
	const then = new Date(date);
	const diff = now.getTime() - then.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (minutes < 1) return "NOW";
	if (minutes < 60) return `${minutes}M AGO`;
	if (hours < 24) return `${hours}H AGO`;
	if (days < 7) return `${days}D AGO`;
	return then.toLocaleDateString().toUpperCase();
}

export default function ActivityPage() {
	const { data, isLoading } = api.activity.getAll.useQuery({ limit: 50 });

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<div className="flex flex-col items-center gap-6">
					<div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
					<p className="font-black font-sans text-sm uppercase tracking-[0.2em] opacity-40">
						Synchronizing...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			<div>
				<h1 className="font-bold font-serif text-7xl uppercase leading-none tracking-tighter md:text-8xl">
					Activity.
				</h1>
				<p className="mt-4 font-bold font-sans text-xl uppercase tracking-widest opacity-60">
					The chronological audit of all transactions.
				</p>
			</div>

			<div className="brutal-shadow border-4 border-black bg-white dark:border-white dark:bg-black">
				{data?.activities && data.activities.length > 0 ? (
					<div className="divide-y-4 divide-black dark:divide-white">
						{data.activities.map((activity) => (
							<div
								className="flex items-start gap-6 p-8 transition-colors hover:bg-[#F0F0F0] dark:hover:bg-zinc-900"
								key={activity.id}
							>
								<div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-black bg-black text-2xl dark:border-white dark:bg-white">
									{getActivityIcon(activity.type)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-baseline gap-2">
										<span className="font-black font-sans text-black text-lg uppercase tracking-tight dark:text-white">
											{activity.user.name || "OPERATIVE"}
										</span>
										<span className="font-black font-sans text-xs uppercase tracking-widest opacity-40">
											{getActivityLabel(activity.type)}
										</span>
									</div>
									{activity.group && (
										<p className="mt-1 font-black font-sans text-[10px] uppercase tracking-widest opacity-60">
											IN {activity.group.name.toUpperCase()}
										</p>
									)}
									{activity.expense && (
										<div className="mt-4 inline-block min-w-[300px] border-2 border-black bg-[#F0F0F0] p-4 dark:border-white dark:bg-zinc-900">
											<div className="flex items-center justify-between">
												<span className="font-black font-sans text-sm uppercase tracking-wider">
													{activity.expense.description.toUpperCase()}
												</span>
												<span className="font-bold font-serif text-xl">
													{formatCurrency(Number(activity.expense.amount))}
												</span>
											</div>
										</div>
									)}
								</div>
								<div className="shrink-0 text-right">
									<span className="font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
										{formatTimeAgo(activity.createdAt)}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<div className="flex h-20 w-20 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
							<Clock className="h-10 w-10" />
						</div>
						<h3 className="mt-8 font-bold font-serif text-4xl uppercase">
							Stagnation.
						</h3>
						<p className="mt-4 max-w-sm font-bold font-sans text-lg uppercase tracking-widest opacity-60">
							The record remains static. No recent operations detected.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
