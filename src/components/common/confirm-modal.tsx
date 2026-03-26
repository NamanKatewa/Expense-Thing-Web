"use client";

import { useState } from "react";

export function ConfirmModal({
	title,
	description,
	confirmText,
	onConfirm,
	onClose,
}: {
	title: string;
	description: string;
	confirmText: string;
	onConfirm: () => void;
	onClose: () => void;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = () => {
		setIsSubmitting(true);
		onConfirm();
		// We'll let the parent handle closing or we can just keep it disabled since it will unmount
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="brutal-shadow relative w-full max-w-md border-4 border-black bg-white p-8 dark:border-white dark:bg-black">
				<h2 className="font-bold font-serif text-3xl text-destructive uppercase dark:text-red-500">
					{title}
				</h2>
				<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
					{description}
				</p>

				<div className="mt-8 flex gap-4 pt-2">
					<button
						className="flex-1 border-2 border-black bg-white py-3 font-black font-sans text-sm uppercase tracking-widest hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
						onClick={onClose}
						type="button"
					>
						ABORT
					</button>
					<button
						className="flex-1 border-2 border-black bg-black py-3 font-black font-sans text-sm text-white uppercase tracking-widest hover:bg-[#E05D36] hover:text-white disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-[#E05D36] dark:hover:text-white"
						disabled={isSubmitting}
						onClick={handleConfirm}
						type="button"
					>
						{isSubmitting ? "PROCESSING..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
