"use client";

import { Receipt, TrendingUp, Users, Wallet } from "lucide-react";
import { api } from "~/trpc/react";

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

function getInitials(name: string | null | undefined) {
	if (!name) return "U";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export default function DashboardPage() {
	const { data: overview, isLoading } = api.dashboard.getOverview.useQuery();

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<div className="flex flex-col items-center gap-6">
					<div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
					<p className="font-black font-sans text-black uppercase tracking-[0.2em] dark:text-white">
						Loading Ledger...
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-16 py-8 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
				<div className="border-black border-b-8 pb-8 dark:border-white">
					<h1 className="font-bold font-serif text-[clamp(4rem,15vw,10rem)] uppercase leading-[0.8] tracking-tighter">
						Overview
					</h1>
					<p className="mt-6 font-bold font-sans text-xl uppercase tracking-[0.2em] opacity-80">
						The Financial State Of Your Syndicate.
					</p>
				</div>

				<div className="grid grid-cols-1 border-black border-t-4 border-l-4 md:grid-cols-2 xl:grid-cols-5 dark:border-white">
					{/* Total Groups */}
					<div className="group relative border-black border-r-4 border-b-4 p-6 transition-all hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
						<div className="flex items-start justify-between xl:flex-col xl:items-start xl:justify-start">
							<div className="brutal-shadow-sm flex h-12 w-12 items-center justify-center border-2 border-black bg-[#002FA7] text-white dark:border-white">
								<Users className="h-6 w-6" />
							</div>
							<div className="text-right xl:mt-8 xl:text-left">
								<p className="font-black font-sans text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100">
									Total Groups
								</p>
								<p className="mt-1 font-bold font-serif text-3xl md:text-4xl xl:text-5xl">
									{overview?.totalGroups ?? 0}
								</p>
							</div>
						</div>
					</div>

					{/* Total Expenses */}
					<div className="group relative border-black border-r-4 border-b-4 p-6 transition-all hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
						<div className="flex items-start justify-between xl:flex-col xl:items-start xl:justify-start">
							<div className="brutal-shadow-sm flex h-12 w-12 items-center justify-center border-2 border-black bg-[#E05D36] text-black dark:border-white">
								<Receipt className="h-6 w-6" />
							</div>
							<div className="text-right xl:mt-8 xl:text-left">
								<p className="font-black font-sans text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100">
									Total Expenses
								</p>
								<p className="mt-1 font-bold font-serif text-3xl md:text-4xl xl:text-5xl">
									{overview?.totalExpenses ?? 0}
								</p>
							</div>
						</div>
					</div>

					{/* Group Total */}
					<div className="group relative border-black border-r-4 border-b-4 p-6 transition-all hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
						<div className="flex items-start justify-between xl:flex-col xl:items-start xl:justify-start">
							<div className="brutal-shadow-sm flex h-12 w-12 items-center justify-center border-2 border-black bg-zinc-400 text-black dark:border-white">
								<Wallet className="h-6 w-6" />
							</div>
							<div className="text-right xl:mt-8 xl:text-left">
								<p className="font-black font-sans text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100">
									Group Total
								</p>
								<p className="mt-1 font-bold font-serif text-2xl md:text-3xl xl:text-4xl">
									{formatCurrency(overview?.groupSpent ?? 0)}
								</p>
							</div>
						</div>
					</div>

					{/* Your Spent */}
					<div className="group relative border-black border-r-4 border-b-4 p-6 transition-all hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
						<div className="flex items-start justify-between xl:flex-col xl:items-start xl:justify-start">
							<div className="brutal-shadow-sm flex h-12 w-12 items-center justify-center border-2 border-black bg-[#B1D182] text-black dark:border-white">
								<Wallet className="h-6 w-6" />
							</div>
							<div className="text-right xl:mt-8 xl:text-left">
								<p className="font-black font-sans text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100">
									Your Spent
								</p>
								<p className="mt-1 font-bold font-serif text-2xl md:text-3xl xl:text-4xl">
									{formatCurrency(overview?.totalSpent ?? 0)}
								</p>
							</div>
						</div>
					</div>

					{/* Your Balance */}
					<div className="group relative border-black border-r-4 border-b-4 p-6 transition-all hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
						<div className="flex items-start justify-between xl:flex-col xl:items-start xl:justify-start">
							<div
								className={`brutal-shadow-sm flex h-12 w-12 items-center justify-center border-2 border-black dark:border-white ${(overview?.balance ?? 0) >= 0 ? "bg-[#B1D182]" : "bg-[#E05D36]"}`}
							>
								<TrendingUp className="h-6 w-6 text-black" />
							</div>
							<div className="text-right xl:mt-8 xl:text-left">
								<p className="font-black font-sans text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100">
									Your Balance
								</p>
								<p className="mt-1 whitespace-nowrap font-bold font-serif text-2xl md:text-3xl xl:text-4xl">
									{(overview?.balance ?? 0) >= 0 ? "+" : ""}
									{formatCurrency(overview?.balance ?? 0)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-zinc-950">
					<h2 className="border-black border-b-4 pb-4 font-bold font-serif text-5xl uppercase dark:border-white">
						Analysis
					</h2>
					<div className="mt-12 space-y-10">
						{overview?.categoryBreakdown &&
						overview.categoryBreakdown.length > 0 ? (
							overview.categoryBreakdown.map((item) => {
								const total = overview.categoryBreakdown.reduce(
									(sum, i) => sum + i.amount,
									0,
								);
								const percentage = total > 0 ? (item.amount / total) * 100 : 0;
								return (
									<div className="group" key={item.category}>
										<div className="mb-3 flex items-center justify-between">
											<span className="font-black font-sans text-xl uppercase tracking-tighter">
												{item.category.replace("_", " ")}
											</span>
											<span className="font-bold font-serif text-3xl">
												{formatCurrency(item.amount)}
											</span>
										</div>
										<div className="h-10 overflow-hidden border-4 border-black bg-white dark:border-white dark:bg-zinc-900">
											<div
												className="h-full bg-black transition-all duration-700 ease-out group-hover:bg-[#E05D36] dark:bg-white dark:group-hover:bg-[#E05D36]"
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								);
							})
						) : (
							<p className="py-16 text-center font-bold font-sans uppercase italic tracking-[0.3em] opacity-40">
								No Data Available.
							</p>
						)}
					</div>
				</div>

				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-zinc-950">
					<h2 className="border-black border-b-4 pb-4 font-bold font-serif text-5xl uppercase dark:border-white">
						Ledger
					</h2>
					<div className="mt-12 space-y-4">
						{overview?.recentExpenses && overview.recentExpenses.length > 0 ? (
							overview.recentExpenses.map((expense) => (
								<div
									className="group flex flex-col gap-4 border-2 border-black p-4 transition-all hover:bg-black hover:text-white sm:flex-row sm:items-center sm:gap-6 sm:p-6 dark:border-white dark:hover:bg-white dark:hover:text-black"
									key={expense.id}
								>
									<div className="flex min-w-0 items-center gap-4 sm:flex-1 sm:gap-6">
										<div className="brutal-shadow-sm flex h-12 w-12 shrink-0 items-center justify-center border-4 border-black bg-white font-black text-black text-xl group-hover:bg-white group-hover:text-black dark:border-white dark:bg-zinc-800 dark:text-white">
											{getInitials(expense.createdBy.name)}
										</div>
										<div className="min-w-0 flex-1 overflow-hidden">
											<p className="truncate font-black font-sans text-xl uppercase tracking-tighter md:text-2xl">
												{expense.description}
											</p>
											<p className="truncate font-bold font-sans text-[10px] uppercase tracking-widest opacity-60 sm:text-sm">
												{expense.group.name} • {expense.createdBy.name}
											</p>
										</div>
									</div>
									<div className="flex shrink-0 items-center justify-end border-black border-t-2 pt-3 sm:border-t-0 sm:pt-0 dark:border-white">
										<p className="font-bold font-serif text-3xl md:text-4xl">
											{formatCurrency(Number(expense.amount))}
										</p>
									</div>
								</div>
							))
						) : (
							<p className="py-16 text-center font-bold font-sans uppercase italic tracking-[0.3em] opacity-40">
								No Recent Activity.
							</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
