"use client";

import { ArrowLeft, Plus, Settings, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BalanceSummary } from "~/components/common/balance-summary";
import { AddExpenseModal } from "~/components/expense/add-expense-modal";
import { ExpenseCard } from "~/components/expense/expense-card";
import { api } from "~/trpc/react";
import type { Balance, Expense, Group, User } from "~/types";

export default function GroupDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const { data: session } = useSession();
	const utils = api.useUtils();

	const { data: group, isLoading } = api.group.getById.useQuery({ id });

	const addExpenseMutation = api.expense.create.useMutation({
		onSuccess: () => {
			void utils.group.getById.invalidate({ id });
		},
	});

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<div className="flex flex-col items-center gap-6">
					<div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
					<p className="font-black font-sans text-sm uppercase tracking-[0.2em] opacity-40">
						RETRIVING RECORDS...
					</p>
				</div>
			</div>
		);
	}

	if (!group) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<h1 className="font-bold font-serif text-6xl uppercase">
					404 / NOT FOUND
				</h1>
				<p className="mt-4 font-bold font-sans text-xl uppercase tracking-widest opacity-60">
					This cell does not exist or has been purged.
				</p>
				<Link
					className="mt-10 border-4 border-black bg-black px-10 py-5 font-black font-sans text-lg text-white uppercase tracking-widest transition-all hover:bg-white hover:text-black dark:border-white"
					href="/groups"
				>
					Return to Groups
				</Link>
			</div>
		);
	}

	// Calculate balances locally for the BalanceSummary component
	const calculateBalances = (): Balance[] => {
		const balanceMap: Record<
			string,
			{ userId: string; user: User; amount: number }
		> = {};

		// Initialize with all members
		for (const member of group.members) {
			balanceMap[member.userId] = {
				userId: member.userId,
				user: member.user,
				amount: 0,
			};
		}

		// Process expenses
		for (const expense of group.expenses) {
			for (const payer of expense.payers) {
				if (balanceMap[payer.userId]) {
					balanceMap[payer.userId]!.amount += Number(payer.amount);
				}
			}
			for (const split of expense.splits) {
				if (balanceMap[split.userId]) {
					balanceMap[split.userId]!.amount -= Number(split.value);
				}
			}
		}

		return Object.values(balanceMap);
	};

	const balances = calculateBalances();

	return (
		<div className="space-y-16 py-8 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<div className="flex flex-col gap-8 border-black border-b-8 pb-8 dark:border-white">
				<Link
					className="inline-flex items-center gap-2 font-black font-sans text-xs uppercase tracking-[0.2em] opacity-60 transition-opacity hover:opacity-100"
					href="/groups"
				>
					<ArrowLeft className="h-4 w-4 stroke-[3]" />
					All Associations
				</Link>
				<div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
					<div className="max-w-4xl">
						<h1 className="font-bold font-serif text-[clamp(3.5rem,10vw,8rem)] uppercase leading-[0.85] tracking-tighter">
							{group.name}.
						</h1>
						{group.description && (
							<p className="mt-6 font-bold font-sans text-xl uppercase tracking-[0.15em] opacity-80">
								{group.description}
							</p>
						)}
					</div>
					<div className="flex gap-4">
						<AddExpenseModal
							group={group as unknown as Group}
							onSubmit={(data) => {
								const totalAmount = data.amount;

								let splits: {
									userId: string;
									type: typeof data.splitType;
									value: number;
								}[] = [];

								if (data.splitType === "EQUAL") {
									const numMembers = data.splitMembers.length;
									const equalValue = totalAmount / numMembers;
									splits = data.splitMembers.map((userId) => ({
										userId,
										type: data.splitType,
										value: equalValue,
									}));
								} else if (data.splitType === "PERCENTAGE") {
									splits = data.splitMembers.map((userId) => {
										const percentage = data.splitValues[userId] ?? 0;
										const value = (percentage / 100) * totalAmount;
										return {
											userId,
											type: data.splitType,
											value: value > 0 ? value : 0.01,
										};
									});
								} else if (data.splitType === "SHARES") {
									const totalShares = data.splitMembers.reduce(
										(sum, userId) => sum + (data.splitValues[userId] ?? 0),
										0,
									);
									splits = data.splitMembers.map((userId) => {
										const shares = data.splitValues[userId] ?? 0;
										const value =
											totalShares > 0
												? (shares / totalShares) * totalAmount
												: 0;
										return {
											userId,
											type: data.splitType,
											value: value > 0 ? value : 0.01,
										};
									});
								} else {
									// EXACT
									splits = data.splitMembers.map((userId) => ({
										userId,
										type: data.splitType,
										value: data.splitValues[userId] ?? 0,
									}));
								}

								addExpenseMutation.mutate({
									groupId: group.id,
									description: data.description,
									amount: data.amount,
									date: data.date,
									category: data.category as Expense["category"],
									payerId: data.payerId,
									payerAmount: data.amount,
									splits: splits,
								});
							}}
							trigger={
								<button className="brutal-shadow flex items-center justify-center gap-3 border-4 border-black bg-[#E05D36] px-8 py-4 font-black font-sans text-black text-lg uppercase tracking-widest transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
									<Plus className="h-6 w-6 stroke-[3]" />
									Log Entry
								</button>
							}
						/>
						<button className="flex h-16 w-16 items-center justify-center border-4 border-black bg-white transition-all hover:bg-black hover:text-white dark:border-white dark:bg-black dark:hover:bg-white dark:hover:text-black">
							<Settings className="h-8 w-8 stroke-[2]" />
						</button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
				<div className="space-y-16 lg:col-span-2">
					<section>
						<div className="mb-10 flex items-center gap-4">
							<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
								<Wallet className="h-5 w-5" />
							</div>
							<h2 className="font-bold font-serif text-4xl uppercase">
								Balances
							</h2>
						</div>
						<BalanceSummary
							balances={balances}
							currentUserId={session?.user?.id}
						/>
					</section>

					<section>
						<div className="mb-10 flex items-center gap-4 border-black border-b-4 pb-4 dark:border-white">
							<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
								<Wallet className="h-5 w-5" />
							</div>
							<h2 className="flex-1 font-bold font-serif text-4xl uppercase">
								Ledger
							</h2>
							<span className="font-black font-sans text-xs uppercase tracking-widest opacity-40">
								{group.expenses.length} TOTAL ENTRIES
							</span>
						</div>

						<div className="space-y-6">
							{group.expenses.length > 0 ? (
								group.expenses.map((expense) => (
									<ExpenseCard
										currentUserId={session?.user?.id}
										expense={expense as unknown as Expense}
										key={expense.id}
									/>
								))
							) : (
								<div className="border-4 border-black border-dashed py-24 text-center dark:border-white">
									<p className="font-bold font-sans text-lg uppercase tracking-widest opacity-40">
										The Ledger is empty. No debts recorded.
									</p>
								</div>
							)}
						</div>
					</section>
				</div>

				<div className="space-y-12">
					<section className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-zinc-950">
						<div className="mb-8 flex items-center gap-4 border-black border-b-2 pb-4 dark:border-white">
							<Users className="h-6 w-6 stroke-[3]" />
							<h3 className="font-black font-sans text-sm uppercase tracking-[0.2em]">
								Active Operatives
							</h3>
						</div>
						<div className="space-y-6">
							{group.members.map((member) => (
								<div
									className="flex items-center justify-between"
									key={member.id}
								>
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-black font-black font-sans text-lg text-white dark:border-white dark:bg-white dark:text-black">
											{member.user.name?.[0]?.toUpperCase() ?? "U"}
										</div>
										<div className="font-sans">
											<p className="font-black text-sm uppercase leading-none tracking-tighter">
												{member.user.name}
											</p>
											<p className="mt-1 font-bold text-[10px] uppercase tracking-widest opacity-40">
												{member.role}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
						<button className="mt-10 w-full border-2 border-black bg-zinc-100 py-4 font-black font-sans text-xs uppercase tracking-widest transition-all hover:bg-black hover:text-white dark:border-white dark:bg-zinc-900">
							Enlist Operative
						</button>
					</section>

					<section className="brutal-shadow border-4 border-black bg-black p-8 text-white dark:border-white dark:bg-white dark:text-black">
						<h3 className="border-white/20 border-b pb-4 font-black font-sans text-sm uppercase tracking-[0.2em] dark:border-black/20">
							Summary
						</h3>
						<div className="mt-6 space-y-4 font-bold font-sans text-sm uppercase tracking-widest">
							<div className="flex justify-between">
								<span className="opacity-60">Total Burn</span>
								<span className="font-serif text-lg">
									$
									{group.expenses
										.reduce((sum, e) => sum + Number(e.amount), 0)
										.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="opacity-60">Settlements</span>
								<span className="font-serif text-lg">
									$
									{group.settlements
										.reduce((sum, s) => sum + Number(s.amount), 0)
										.toFixed(2)}
								</span>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
