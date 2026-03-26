"use client";

import { ArrowRight, ChevronLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "~/components/common/confirm-modal";
import { api } from "~/trpc/react";

function getInitials(name: string | null | undefined) {
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

function CreateSettlementModal({
	groupId,
	suggestion,
	onClose,
	onSuccess,
}: {
	groupId: string;
	suggestion: {
		fromUserId: string;
		toUserId: string;
		amount: number;
		fromUser: { id: string; name: string | null; image: string | null } | null;
		toUser: { id: string; name: string | null; image: string | null } | null;
	};
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createSettlement = api.settlement.create.useMutation({
		onSuccess: () => {
			onSuccess();
			onClose();
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		await createSettlement.mutateAsync({
			groupId,
			fromUserId: suggestion.fromUserId,
			toUserId: suggestion.toUserId,
			amount: suggestion.amount,
			description: description.trim() || undefined,
		});
		setIsSubmitting(false);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="brutal-shadow relative w-full max-w-md border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
				<h2 className="font-bold font-serif text-3xl uppercase">
					Record Settlement
				</h2>
				<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
					Document the resolution of a debt.
				</p>

				<div className="mt-8 border-4 border-black bg-[#F0F0F0] p-6 dark:border-white dark:bg-zinc-900">
					<div className="flex items-center justify-between">
						<div className="flex flex-col items-center gap-2">
							<div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white font-black font-sans text-black text-xs uppercase dark:border-white dark:bg-black dark:text-white">
								{getInitials(suggestion.fromUser?.name)}
							</div>
							<span className="max-w-[80px] truncate text-center font-black font-sans text-[10px] uppercase tracking-tighter">
								{suggestion.fromUser?.name || "SOURCE"}
							</span>
						</div>
						<div className="flex flex-col items-center">
							<ArrowRight className="h-6 w-6" />
						</div>
						<div className="flex flex-col items-center gap-2">
							<div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-black font-black font-sans text-white text-xs uppercase dark:border-white dark:bg-white dark:text-black">
								{getInitials(suggestion.toUser?.name)}
							</div>
							<span className="max-w-[80px] truncate text-center font-black font-sans text-[10px] uppercase tracking-tighter">
								{suggestion.toUser?.name || "TARGET"}
							</span>
						</div>
					</div>
					<div className="mt-6 border-black border-t-2 pt-4 text-center dark:border-white">
						<p className="font-bold font-serif text-4xl text-black dark:text-white">
							{formatCurrency(suggestion.amount)}
						</p>
					</div>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div>
						<label className="mb-2 block font-black font-sans text-xs uppercase tracking-[0.2em]">
							Transaction Note (Optional)
						</label>
						<input
							className="w-full border-2 border-black bg-white px-4 py-3 font-bold font-sans text-black uppercase placeholder:text-black/30 focus:bg-black focus:text-white focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black dark:placeholder:text-white/30"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="e.g., VENMO TRANSFER"
							type="text"
							value={description}
						/>
					</div>

					<div className="flex gap-4">
						<button
							className="flex-1 border-2 border-black bg-white py-3 font-black font-sans text-sm uppercase tracking-widest hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
							onClick={onClose}
							type="button"
						>
							Abort
						</button>
						<button
							className="flex-1 border-2 border-black bg-black py-3 font-black font-sans text-sm text-white uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
							disabled={isSubmitting}
							type="submit"
						>
							{isSubmitting ? "PROCESSING..." : "FINALIZE"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default function SettlementsPage() {
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
	const [showSettlementModal, setShowSettlementModal] = useState<{
		groupId: string;
		suggestion: {
			fromUserId: string;
			toUserId: string;
			amount: number;
			fromUser: {
				id: string;
				name: string | null;
				image: string | null;
			} | null;
			toUser: { id: string; name: string | null; image: string | null } | null;
		};
	} | null>(null);
	const [settlementToDelete, setSettlementToDelete] = useState<string | null>(
		null,
	);

	const utils = api.useUtils();
	const { data: groups } = api.group.getAll.useQuery();

	const { data: suggestedSettlements, isLoading: suggestionsLoading } =
		api.settlement.getSuggested.useQuery(
			{ groupId: selectedGroup! },
			{ enabled: !!selectedGroup },
		);

	const { data: settlements, isLoading: settlementsLoading } =
		api.settlement.getAllByGroup.useQuery(
			{ groupId: selectedGroup! },
			{ enabled: !!selectedGroup },
		);

	const deleteSettlementMutation = api.settlement.delete.useMutation({
		onSuccess: () => {
			void utils.settlement.getAllByGroup.invalidate({
				groupId: selectedGroup!,
			});
			void utils.settlement.getSuggested.invalidate({
				groupId: selectedGroup!,
			});
			setSettlementToDelete(null);
		},
	});

	const handleDeleteSettlement = () => {
		if (settlementToDelete) {
			deleteSettlementMutation.mutate({ id: settlementToDelete });
		}
	};

	const handleGroupChange = (groupId: string) => {
		setSelectedGroup(groupId === selectedGroup ? null : groupId);
	};

	return (
		<div className="space-y-12">
			<div>
				<h1 className="font-bold font-serif text-7xl uppercase leading-none tracking-tighter md:text-8xl">
					Settlements.
				</h1>
				<p className="mt-4 font-bold font-sans text-xl uppercase tracking-widest opacity-60">
					The resolution of all outstanding balances.
				</p>
			</div>

			{!selectedGroup ? (
				<div className="space-y-6">
					<h2 className="font-black font-sans text-xs uppercase tracking-[0.3em] opacity-40">
						Target Cell Selection
					</h2>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{groups?.map((group) => (
							<button
								className="group brutal-shadow flex items-center gap-6 border-4 border-black bg-white p-8 text-left transition-all hover:-translate-x-1 hover:-translate-y-1 dark:border-white dark:bg-black"
								key={group.id}
								onClick={() => handleGroupChange(group.id)}
							>
								<div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-black font-bold font-serif text-2xl text-white dark:border-white dark:bg-white dark:text-black">
									{getInitials(group.name)}
								</div>
								<div className="flex-1">
									<h3 className="font-bold font-serif text-2xl uppercase leading-tight">
										{group.name}
									</h3>
									<p className="mt-1 font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
										{group._count.members} MEMBERS
									</p>
								</div>
							</button>
						))}
					</div>
				</div>
			) : (
				<div className="space-y-10">
					<button
						className="inline-flex items-center gap-3 font-black font-sans text-xs uppercase tracking-[0.2em] decoration-2 underline-offset-8 hover:underline"
						onClick={() => setSelectedGroup(null)}
					>
						<ChevronLeft className="h-4 w-4" />
						Switch Target
					</button>

					<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
						<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
							<h2 className="font-bold font-serif text-4xl uppercase">
								Proposals.
							</h2>
							<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
								Calculated resolutions to balance the books.
							</p>

							{suggestionsLoading ? (
								<div className="mt-12 flex items-center justify-center py-12">
									<div className="h-10 w-10 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
								</div>
							) : suggestedSettlements && suggestedSettlements.length > 0 ? (
								<div className="mt-10 space-y-6">
									{suggestedSettlements.map((suggestion, index) => (
										<div
											className="border-2 border-black bg-[#F0F0F0] p-6 dark:border-white dark:bg-zinc-900"
											key={index}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-4">
													<div
														className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white font-black font-sans text-black text-xs uppercase dark:border-white dark:bg-black dark:text-white"
														title={suggestion.fromUser?.name ?? ""}
													>
														{getInitials(suggestion.fromUser?.name)}
													</div>
													<ArrowRight className="h-4 w-4 opacity-40" />
													<div
														className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-black font-sans text-white text-xs uppercase dark:border-white dark:bg-white dark:text-black"
														title={suggestion.toUser?.name ?? ""}
													>
														{getInitials(suggestion.toUser?.name)}
													</div>
												</div>
												<div className="flex items-center gap-6">
													<span className="font-bold font-serif text-2xl">
														{formatCurrency(suggestion.amount)}
													</span>
													<button
														className="border-2 border-black bg-black px-4 py-2 font-black font-sans text-[10px] text-white uppercase tracking-widest transition-all hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
														onClick={() =>
															setShowSettlementModal({
																groupId: selectedGroup!,
																suggestion,
															})
														}
													>
														Settle
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="mt-12 border-2 border-black border-dashed py-12 text-center dark:border-white">
									<p className="font-bold font-sans text-sm uppercase tracking-widest opacity-40">
										Perfect Balance Achieved.
									</p>
								</div>
							)}
						</div>

						<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
							<h2 className="font-bold font-serif text-4xl uppercase">
								History.
							</h2>
							<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
								The permanent record of resolved debts.
							</p>

							{settlementsLoading ? (
								<div className="mt-12 flex items-center justify-center py-12">
									<div className="h-10 w-10 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
								</div>
							) : settlements && settlements.length > 0 ? (
								<div className="mt-10 space-y-6">
									{settlements.map((settlement) => (
										<div
											className="border-2 border-black bg-white p-6 dark:border-white dark:bg-black"
											key={settlement.id}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-4">
													<div
														className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white font-black font-sans text-black text-xs uppercase dark:border-white dark:bg-black dark:text-white"
														title={settlement.fromUser.name ?? ""}
													>
														{getInitials(settlement.fromUser.name)}
													</div>
													<ArrowRight className="h-4 w-4 opacity-40" />
													<div
														className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-black font-sans text-white text-xs uppercase dark:border-white dark:bg-white dark:text-black"
														title={settlement.toUser.name ?? ""}
													>
														{getInitials(settlement.toUser.name)}
													</div>
												</div>
												<div className="flex items-center justify-end gap-4 text-right">
													<div>
														<p className="font-bold font-serif text-2xl">
															{formatCurrency(Number(settlement.amount))}
														</p>
														<p className="font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
															{new Date(settlement.date).toLocaleDateString()}
														</p>
													</div>
													<button
														className="text-red-500 transition-colors hover:text-red-700"
														onClick={() => setSettlementToDelete(settlement.id)}
														title="Delete settlement"
													>
														<Trash2 className="h-5 w-5" />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="mt-12 border-2 border-black border-dashed py-12 text-center dark:border-white">
									<p className="font-bold font-sans text-sm uppercase tracking-widest opacity-40">
										The Record is Empty.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{showSettlementModal && (
				<CreateSettlementModal
					groupId={showSettlementModal.groupId}
					onClose={() => setShowSettlementModal(null)}
					onSuccess={() => {
						void utils.settlement.getSuggested.invalidate({
							groupId: selectedGroup!,
						});
						void utils.settlement.getAllByGroup.invalidate({
							groupId: selectedGroup!,
						});
					}}
					suggestion={showSettlementModal.suggestion}
				/>
			)}

			{settlementToDelete && (
				<ConfirmModal
					confirmText="DELETE SETTLEMENT"
					description="Are you sure you want to delete this settlement record? Your balances will reopen."
					onClose={() => setSettlementToDelete(null)}
					onConfirm={handleDeleteSettlement}
					title="DELETE SETTLEMENT"
				/>
			)}
		</div>
	);
}
