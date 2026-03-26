"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function AddMemberModal({
	groupId,
	onClose,
	onSuccess,
}: {
	groupId: string;
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const addMember = api.group.addMember.useMutation({
		onSuccess: () => {
			onSuccess();
			onClose();
		},
		onError: (err) => {
			setError(err.message);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) return;
		setIsSubmitting(true);
		setError("");
		try {
			await addMember.mutateAsync({ groupId, email: email.trim() });
		} catch {
			// error handled in onError
		}
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
					Add Operative
				</h2>
				<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
					Enlist another member to this collective.
				</p>

				{error && (
					<div className="mt-6 border-2 border-[#E05D36] bg-[#FFF0EB] p-3 font-bold font-sans text-[#E05D36] text-xs uppercase tracking-wider dark:bg-[#331100]">
						{error}
					</div>
				)}

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div>
						<label className="mb-2 block font-black font-sans text-xs uppercase tracking-[0.2em]">
							Email Address
						</label>
						<input
							className="w-full border-2 border-black bg-white px-4 py-3 font-bold font-sans text-black uppercase placeholder:text-black/30 focus:bg-black focus:text-white focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black dark:placeholder:text-white/30"
							onChange={(e) => setEmail(e.target.value)}
							placeholder="OPERATIVE@SYNDICATE.COM"
							required
							type="email"
							value={email}
						/>
					</div>

					<div className="flex gap-4 pt-2">
						<button
							className="flex-1 border-2 border-black bg-white py-3 font-black font-sans text-sm uppercase tracking-widest hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
							onClick={onClose}
							type="button"
						>
							Cancel
						</button>
						<button
							className="flex-1 border-2 border-black bg-black py-3 font-black font-sans text-sm text-white uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
							disabled={isSubmitting || !email.trim()}
							type="submit"
						>
							{isSubmitting ? "ENROLLING..." : "ENROLL"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
