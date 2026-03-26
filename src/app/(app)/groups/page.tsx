"use client";

import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";

function getInitials(name: string | null | undefined) {
	if (!name) return "G";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function CreateGroupModal({
	onClose,
	onSuccess,
}: {
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createGroup = api.group.create.useMutation({
		onSuccess: () => {
			onSuccess();
			onClose();
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		setIsSubmitting(true);
		await createGroup.mutateAsync({
			name: name.trim(),
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
					Create Group
				</h2>
				<p className="mt-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
					Establish a new cell for collective accounting.
				</p>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div>
						<label className="mb-2 block font-black font-sans text-xs uppercase tracking-[0.2em]">
							Designation
						</label>
						<input
							className="w-full border-2 border-black bg-white px-4 py-3 font-bold font-sans text-black uppercase placeholder:text-black/30 focus:bg-black focus:text-white focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black dark:placeholder:text-white/30"
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., TRIP TO BERLIN"
							required
							type="text"
							value={name}
						/>
					</div>

					<div>
						<label className="mb-2 block font-black font-sans text-xs uppercase tracking-[0.2em]">
							Brief (Optional)
						</label>
						<textarea
							className="w-full resize-none border-2 border-black bg-white px-4 py-3 font-bold font-sans text-black uppercase placeholder:text-black/30 focus:bg-black focus:text-white focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black dark:placeholder:text-white/30"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="WHAT IS THE PURPOSE?"
							rows={3}
							value={description}
						/>
					</div>

					<div className="flex gap-4 pt-2">
						<button
							className="flex-1 border-2 border-black bg-white py-3 font-black font-sans text-sm uppercase tracking-widest hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
							onClick={onClose}
							type="button"
						>
							Abort
						</button>
						<button
							className="flex-1 border-2 border-black bg-black py-3 font-black font-sans text-sm text-white uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
							disabled={isSubmitting || !name.trim()}
							type="submit"
						>
							{isSubmitting ? "PROCESSING..." : "ESTABLISH"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

import { AddMemberModal } from "~/components/group/add-member-modal";

export default function GroupsPage() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showAddMemberModal, setShowAddMemberModal] = useState<string | null>(
		null,
	);

	const utils = api.useUtils();
	const { data: groups, isLoading } = api.group.getAll.useQuery();

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
			<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<div>
					<h1 className="font-bold font-serif text-7xl uppercase leading-none tracking-tighter md:text-8xl">
						Groups.
					</h1>
					<p className="mt-4 font-bold font-sans text-xl uppercase tracking-widest opacity-60">
						The collective ledger of your associations.
					</p>
				</div>
				<button
					className="brutal-shadow flex items-center justify-center gap-3 border-4 border-black bg-black px-8 py-4 font-black font-sans text-lg text-white uppercase tracking-widest transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
					onClick={() => setShowCreateModal(true)}
				>
					<Plus className="h-5 w-5" />
					New Cell
				</button>
			</div>

			{groups && groups.length > 0 ? (
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{groups.map((group) => (
						<div
							className="group brutal-shadow relative border-4 border-black bg-white p-8 transition-all hover:-translate-x-1 hover:-translate-y-1 dark:border-white dark:bg-black"
							key={group.id}
						>
							<div className="relative">
								<div className="flex items-start justify-between">
									<div className="flex flex-col gap-4">
										<div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-black font-bold font-serif text-2xl text-white dark:border-white dark:bg-white dark:text-black">
											{getInitials(group.name)}
										</div>
										<div>
											<h3 className="font-bold font-serif text-3xl uppercase leading-tight">
												{group.name}
											</h3>
											{group.description && (
												<p className="mt-2 line-clamp-1 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
													{group.description}
												</p>
											)}
										</div>
									</div>
								</div>

								<div className="mt-8 border-black border-t-4 pt-6 dark:border-white">
									<div className="flex items-center justify-between">
										<div className="flex -space-x-3">
											{group.members.slice(0, 4).map((member) => (
												<div
													className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white font-black font-sans text-black text-xs uppercase dark:border-white dark:bg-black dark:text-white"
													key={member.user.id}
													title={String(
														member.user.name ?? member.user.email ?? "",
													)}
												>
													{getInitials(member.user.name)}
												</div>
											))}
											{group.members.length > 4 && (
												<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-black font-sans text-white text-xs uppercase dark:border-white dark:bg-white dark:text-black">
													+{group.members.length - 4}
												</div>
											)}
										</div>
										<div className="text-right">
											<span className="block font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
												Status
											</span>
											<span className="font-black font-sans text-xs uppercase tracking-widest">
												{group._count.members} OPS / {group._count.expenses}{" "}
												EXPS
											</span>
										</div>
									</div>
								</div>

								<div className="mt-8 flex gap-4">
									<button
										className="flex-1 border-2 border-black bg-white py-3 font-black font-sans text-xs uppercase tracking-[0.2em] transition-all hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
										onClick={() => setShowAddMemberModal(group.id)}
									>
										Add
									</button>
									<a
										className="flex-1 border-2 border-black bg-black py-3 text-center font-black font-sans text-white text-xs uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
										href={`/groups/${group.id}`}
									>
										Access
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center border-4 border-black border-dashed py-24 text-center dark:border-white">
					<div className="flex h-20 w-20 items-center justify-center border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
						<Users className="h-10 w-10" />
					</div>
					<h3 className="mt-6 font-bold font-serif text-4xl uppercase">
						No Associations.
					</h3>
					<p className="mt-4 max-w-sm font-bold font-sans text-lg uppercase tracking-widest opacity-60">
						You operate in isolation. Establish a group to begin collaborative
						accounting.
					</p>
					<button
						className="brutal-shadow mt-10 border-4 border-black bg-black px-10 py-5 font-black font-sans text-lg text-white uppercase tracking-widest hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
						onClick={() => setShowCreateModal(true)}
					>
						Initiate Group
					</button>
				</div>
			)}

			{showCreateModal && (
				<CreateGroupModal
					onClose={() => setShowCreateModal(false)}
					onSuccess={() => void utils.group.getAll.invalidate()}
				/>
			)}

			{showAddMemberModal && (
				<AddMemberModal
					groupId={showAddMemberModal}
					onClose={() => setShowAddMemberModal(null)}
					onSuccess={() => void utils.group.getAll.invalidate()}
				/>
			)}
		</div>
	);
}
