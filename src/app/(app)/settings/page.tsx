"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function SettingsPage() {
	const { data: session, update } = useSession();
	const utils = api.useUtils();
	const [name, setName] = useState(session?.user?.name ?? "");
	const [isUpdating, setIsUpdating] = useState(false);
	const [message, setMessage] = useState<{
		text: string;
		type: "success" | "error";
	} | null>(null);

	const updateProfile = api.user.update.useMutation({
		onSuccess: async () => {
			await update();
			void utils.dashboard.invalidate();
			void utils.group.invalidate();
			setMessage({ text: "Profile updated successfully", type: "success" });
			setIsUpdating(false);
		},
		onError: (error: { message: string }) => {
			setMessage({ text: error.message, type: "error" });
			setIsUpdating(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsUpdating(true);
		setMessage(null);
		updateProfile.mutate({ name });
	};

	if (!session) {
		return (
			<div className="flex h-96 items-center justify-center">
				<div className="flex flex-col items-center gap-6">
					<div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
					<p className="font-black font-sans uppercase tracking-[0.2em]">
						Loading Identity...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-16 py-8 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<div className="border-black border-b-8 pb-8 dark:border-white">
				<h1 className="font-bold font-serif text-[clamp(4rem,12vw,8rem)] uppercase leading-[0.8] tracking-tighter">
					Settings
				</h1>
				<p className="mt-6 font-bold font-sans text-xl uppercase tracking-[0.2em] opacity-80">
					Configure Your Syndicate Presence.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-zinc-950">
					<h2 className="border-black border-b-4 pb-4 font-bold font-serif text-5xl uppercase dark:border-white">
						Profile
					</h2>
					<div className="mt-10">
						<div className="mb-10 flex items-center gap-8">
							<div className="brutal-shadow flex h-24 w-24 items-center justify-center border-4 border-black bg-black font-black text-4xl text-white dark:border-white dark:bg-white dark:text-black">
								{session.user?.name?.[0]?.toUpperCase() ?? "U"}
							</div>
							<div>
								<p className="font-black font-sans text-xl uppercase tracking-tighter">
									{session.user?.name}
								</p>
								<p className="font-bold font-sans text-sm uppercase tracking-widest opacity-60">
									{session.user?.email}
								</p>
							</div>
						</div>

						{message && (
							<div
								className={`mb-8 border-2 p-4 font-black font-sans text-sm uppercase tracking-widest ${message.type === "success" ? "border-black bg-[#B1D182] dark:border-white" : "border-[#E05D36] bg-[#FFF0EB] text-[#E05D36]"}`}
							>
								{message.text}
							</div>
						)}

						<form className="space-y-8" onSubmit={handleSubmit}>
							<div>
								<label
									className="mb-3 block font-black font-sans text-xs uppercase tracking-[0.2em] opacity-70"
									htmlFor="settings-name"
								>
									Full Name
								</label>
								<input
									className="w-full border-2 border-black bg-white px-5 py-4 font-bold font-sans text-black uppercase tracking-widest transition-colors placeholder:text-black/30 focus:bg-black focus:text-white focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black dark:placeholder:text-white/30"
									id="settings-name"
									onChange={(e) => setName(e.target.value)}
									placeholder="YOUR NAME"
									required
									type="text"
									value={name}
								/>
							</div>
							<div className="flex gap-4 pt-4">
								<button
									className="flex-1 border-4 border-black bg-black px-8 py-4 font-black font-sans text-sm text-white uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
									disabled={isUpdating || name === session.user?.name}
									type="submit"
								>
									{isUpdating ? "Updating..." : "Save Changes"}
								</button>
							</div>
						</form>
					</div>
				</div>

				<div className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-zinc-950">
					<h2 className="border-black border-b-4 pb-4 font-bold font-serif text-5xl text-[#E05D36] uppercase dark:border-white">
						Danger Zone
					</h2>
					<div className="mt-10 space-y-8">
						<div className="border-2 border-[#E05D36] bg-[#FFF0EB] p-6 dark:bg-[#331100]">
							<h3 className="font-black font-sans text-[#E05D36] text-lg uppercase tracking-tight">
								Purge Account
							</h3>
							<p className="mt-2 font-bold font-sans text-[#E05D36] text-sm uppercase tracking-widest opacity-80">
								Permanently erase your identity and all ledger history. This
								action cannot be reversed.
							</p>
							<div className="mt-8">
								<button
									className="border-2 border-[#E05D36] bg-transparent px-6 py-3 font-black font-sans text-[#E05D36] text-xs uppercase tracking-[0.2em] transition-all hover:bg-[#E05D36] hover:text-white"
									type="button"
								>
									Terminate Membership
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
