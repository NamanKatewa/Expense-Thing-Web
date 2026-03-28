"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
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

export interface SettlementSuggestion {
	fromUserId: string;
	toUserId: string;
	amount: number;
	fromUser: { id: string; name: string | null; image: string | null } | null;
	toUser: { id: string; name: string | null; image: string | null } | null;
}

interface CreateSettlementModalProps {
	groupId: string;
	suggestion: SettlementSuggestion;
	onClose: () => void;
	onSuccess: () => void;
}

export function CreateSettlementModal({
	groupId,
	suggestion,
	onClose,
	onSuccess,
}: CreateSettlementModalProps) {
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
