import { Minus, Plus } from "lucide-react";
import type { Balance, User } from "~/types";

interface BalanceSummaryProps {
	balances: Balance[];
	currentUserId?: string;
	onSettle?: (user: User, amount: number) => void;
}

export function BalanceSummary({
	balances,
	currentUserId,
	onSettle,
}: BalanceSummaryProps) {
	const debtors = balances.filter(
		(b) => b.amount < 0 && b.userId !== currentUserId,
	);
	const creditors = balances.filter(
		(b) => b.amount > 0 && b.userId !== currentUserId,
	);

	const getInitials = (name: string | null | undefined) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (balances.length === 0) {
		return (
			<div className="border-4 border-black border-dashed p-12 text-center dark:border-white">
				<p className="font-black font-sans text-sm uppercase tracking-widest opacity-40">
					No Balance Data. Record expenses to initiate accounting.
				</p>
			</div>
		);
	}

	const currentUserBalance = balances.find((b) => b.userId === currentUserId);

	return (
		<div className="space-y-8">
			{currentUserBalance && currentUserBalance.amount !== 0 && (
				<div className="brutal-shadow border-4 border-black bg-black p-8 dark:border-white dark:bg-white">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-black font-sans text-[10px] text-white/40 uppercase tracking-[0.2em] dark:text-black/40">
								Personal Standing
							</p>
							<div className="mt-2 flex items-center gap-4">
								{currentUserBalance.amount > 0 ? (
									<Plus className="h-8 w-8 text-white dark:text-black" />
								) : (
									<Minus className="h-8 w-8 text-white dark:text-black" />
								)}
								<span className="font-bold font-serif text-5xl text-white dark:text-black">
									${Math.abs(currentUserBalance.amount).toFixed(2)}
								</span>
							</div>
						</div>
						<div className="text-right">
							<span className="font-black font-sans text-white text-xs uppercase tracking-widest dark:text-black">
								{currentUserBalance.amount > 0 ? "TOTAL CREDIT" : "TOTAL DEBT"}
							</span>
						</div>
					</div>
				</div>
			)}

			{currentUserBalance && currentUserBalance.amount === 0 && (
				<div className="border-4 border-black bg-[#F0F0F0] p-8 dark:border-white dark:bg-zinc-900">
					<p className="font-bold font-serif text-3xl text-black uppercase dark:text-white">
						System Balanced.
					</p>
					<p className="mt-2 font-bold font-sans text-sm uppercase tracking-widest opacity-40">
						You have no outstanding obligations or receivables.
					</p>
				</div>
			)}

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				{debtors.length > 0 && (
					<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
						<h4 className="mb-6 font-black font-sans text-xs uppercase tracking-[0.3em] opacity-40">
							Obligations
						</h4>
						<div className="space-y-4">
							{debtors.map((debtor) => (
								<div
									className="border-2 border-black bg-[#F0F0F0] p-6 dark:border-white dark:bg-zinc-900"
									key={debtor.userId}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white font-black font-sans text-[10px] text-black uppercase dark:border-white dark:bg-black dark:text-white">
												{getInitials(debtor.user.name)}
											</div>
											<span className="font-bold font-sans text-sm uppercase tracking-tight">
												{debtor.user.name}
											</span>
										</div>
										<div className="flex items-center gap-6">
											<span className="font-bold font-serif text-xl">
												-${Math.abs(debtor.amount).toFixed(2)}
											</span>
											{onSettle && (
												<button
													className="border-2 border-black bg-black px-4 py-2 font-black font-sans text-[10px] text-white uppercase tracking-widest transition-all hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
													onClick={() =>
														onSettle(debtor.user, Math.abs(debtor.amount))
													}
												>
													Settle
												</button>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{creditors.length > 0 && (
					<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
						<h4 className="mb-6 font-black font-sans text-xs uppercase tracking-[0.3em] opacity-40">
							Receivables
						</h4>
						<div className="space-y-4">
							{creditors.map((creditor) => (
								<div
									className="border-2 border-black bg-white p-6 dark:border-white dark:bg-black"
									key={creditor.userId}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-black font-sans text-[10px] text-white uppercase dark:border-white dark:bg-white dark:text-black">
												{getInitials(creditor.user.name)}
											</div>
											<span className="font-bold font-sans text-sm uppercase tracking-tight">
												{creditor.user.name}
											</span>
										</div>
										<div className="flex items-center">
											<span className="font-bold font-serif text-xl">
												+${creditor.amount.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
