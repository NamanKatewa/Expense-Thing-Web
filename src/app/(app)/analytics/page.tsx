"use client";

import { api } from "~/trpc/react";

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

function getCategoryIcon(category: string) {
	const icons: Record<string, string> = {
		FOOD: "🍔",
		TRANSPORT: "🚗",
		HOUSING: "🏠",
		UTILITIES: "💡",
		ENTERTAINMENT: "🎬",
		SHOPPING: "🛍️",
		HEALTHCARE: "🏥",
		TRAVEL: "✈️",
		EDUCATION: "📚",
		OTHER: "📦",
	};
	return icons[category] || "📦";
}

export default function AnalyticsPage() {
	const { data: categoryBreakdown, isLoading: categoryLoading } =
		api.dashboard.getCategoryBreakdown.useQuery();
	const { data: monthlySpending, isLoading: monthlyLoading } =
		api.dashboard.getMonthlySpending.useQuery({ months: 12 });
	const { data: stats } = api.dashboard.getStats.useQuery();

	const maxMonthly = monthlySpending
		? Math.max(...monthlySpending.map((m) => m.amount), 1)
		: 1;
	const totalSpending =
		categoryBreakdown?.reduce((sum, c) => sum + c.amount, 0) || 0;

	return (
		<div className="space-y-12">
			<div>
				<h1 className="font-bold font-serif text-7xl uppercase leading-none tracking-tighter md:text-8xl">
					Analytics.
				</h1>
				<p className="mt-4 font-bold font-sans text-xl uppercase tracking-widest opacity-60">
					The quantitative analysis of your fiscal behavior.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
					<p className="font-black font-sans text-xs uppercase tracking-[0.2em] opacity-40">
						Total Expenditure
					</p>
					<p className="mt-4 font-bold font-serif text-5xl leading-none">
						{formatCurrency(stats?.totalSpent ?? 0)}
					</p>
				</div>
				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
					<p className="font-black font-sans text-xs uppercase tracking-[0.2em] opacity-40">
						Monthly Mean
					</p>
					<p className="mt-4 font-bold font-serif text-5xl leading-none">
						{formatCurrency((stats?.totalSpent ?? 0) / 12)}
					</p>
				</div>
				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
					<p className="font-black font-sans text-xs uppercase tracking-[0.2em] opacity-40">
						Primary Vector
					</p>
					<p className="mt-4 truncate font-bold font-serif text-4xl uppercase leading-none">
						{categoryBreakdown && categoryBreakdown.length > 0
							? categoryBreakdown
									.reduce((a, b) => (a.amount > b.amount ? a : b))
									.category.replace("_", " ")
							: "N/A"}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
					<h2 className="font-bold font-serif text-4xl uppercase">
						Temporal Flow.
					</h2>
					<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
						Chronological record of resource depletion.
					</p>

					{monthlyLoading ? (
						<div className="mt-12 flex h-64 items-center justify-center">
							<div className="h-10 w-10 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
						</div>
					) : (
						<div className="mt-12">
							<div className="flex h-64 items-end gap-3 border-black border-b-4 dark:border-white">
								{monthlySpending?.map((month) => {
									const height = (month.amount / maxMonthly) * 100;
									return (
										<div className="group flex-1" key={month.month}>
											<div
												className="relative w-full border-2 border-black border-b-0 bg-black transition-all duration-300 group-hover:bg-white dark:border-white dark:bg-white dark:group-hover:bg-black"
												style={{ height: `${Math.max(height, 4)}%` }}
											>
												<div className="absolute -top-10 left-1/2 -translate-x-1/2 border-2 border-black bg-white px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100 dark:border-white dark:bg-black">
													<span className="font-black font-sans text-[10px] uppercase">
														{formatCurrency(month.amount)}
													</span>
												</div>
											</div>
											<p className="mt-3 text-center font-black font-sans text-[10px] uppercase tracking-tighter opacity-40">
												{month.month.slice(5)}
											</p>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
					<h2 className="font-bold font-serif text-4xl uppercase">Taxonomy.</h2>
					<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
						Categorical distribution of financial output.
					</p>

					{categoryLoading ? (
						<div className="mt-12 flex h-64 items-center justify-center">
							<div className="h-10 w-10 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
						</div>
					) : categoryBreakdown && categoryBreakdown.length > 0 ? (
						<div className="mt-10 space-y-6">
							{categoryBreakdown
								.sort((a, b) => b.amount - a.amount)
								.map((item) => {
									const percentage =
										totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
									return (
										<div className="group" key={item.category}>
											<div className="mb-2 flex items-center justify-between">
												<div className="flex items-center gap-3">
													<span className="text-xl">
														{getCategoryIcon(item.category)}
													</span>
													<span className="font-black font-sans text-xs uppercase tracking-widest">
														{item.category.replace("_", " ")}
													</span>
												</div>
												<div className="text-right">
													<span className="font-bold font-serif text-xl">
														{formatCurrency(item.amount)}
													</span>
													<span className="ml-3 font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
														{percentage.toFixed(1)}%
													</span>
												</div>
											</div>
											<div className="h-6 border-2 border-black bg-[#F0F0F0] dark:border-white dark:bg-zinc-900">
												<div
													className="h-full bg-black transition-all duration-500 dark:bg-white"
													style={{
														width: `${percentage}%`,
													}}
												/>
											</div>
										</div>
									);
								})}
						</div>
					) : (
						<div className="mt-12 border-2 border-black border-dashed py-12 text-center dark:border-white">
							<p className="font-bold font-sans text-sm uppercase tracking-widest opacity-40">
								No Taxonomy Data.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
