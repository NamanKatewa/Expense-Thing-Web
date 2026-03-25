import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Balance, Group } from "~/types";

interface GroupCardProps {
	group: Group;
	balance?: Balance;
}

export function GroupCard({ group, balance }: GroupCardProps) {
	const memberCount = group.members.length;
	const previewMembers = group.members.slice(0, 3);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<Link href={`/groups/${group.id}`}>
			<div className="group brutal-shadow border-4 border-black bg-white p-8 transition-all hover:-translate-x-1 hover:-translate-y-1 dark:border-white dark:bg-black">
				<div className="flex items-start justify-between border-black border-b-4 pb-6 dark:border-white">
					<div className="flex flex-col gap-4">
						{group.image ? (
							<div className="border-2 border-black dark:border-white">
								<Image
									alt={group.name}
									className="h-14 w-14 object-cover"
									height={56}
									src={group.image}
									width={56}
								/>
							</div>
						) : (
							<div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-black font-bold font-serif text-2xl text-white dark:border-white dark:bg-white dark:text-black">
								{getInitials(group.name)}
							</div>
						)}
						<h3 className="font-bold font-serif text-3xl uppercase leading-tight">
							{group.name}
						</h3>
					</div>
					<div className="flex items-center gap-2 border-2 border-black bg-black px-3 py-1 font-black font-sans text-white text-xs uppercase dark:border-white dark:bg-white dark:text-black">
						<Users className="h-4 w-4" />
						<span>{memberCount}</span>
					</div>
				</div>

				<div className="mt-6">
					{group.description && (
						<p className="mb-6 line-clamp-2 font-bold font-sans text-sm uppercase tracking-wider opacity-60">
							{group.description}
						</p>
					)}

					<div className="flex items-center justify-between">
						<div className="flex -space-x-3">
							{previewMembers.map((member) => (
								<div
									className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white font-black font-sans text-[10px] text-black uppercase dark:border-white dark:bg-black dark:text-white"
									key={member.id}
								>
									{getInitials(member.user.name ?? member.user.email ?? "?")}
								</div>
							))}
							{memberCount > 3 && (
								<div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-black font-black font-sans text-[10px] text-white uppercase dark:border-white dark:bg-white dark:text-black">
									+{memberCount - 3}
								</div>
							)}
						</div>

						{balance && (
							<div className="text-right">
								<span className="block font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
									Exposure
								</span>
								<div
									className={`font-bold font-serif text-xl ${
										balance.amount > 0
											? "text-black dark:text-white"
											: balance.amount < 0
												? "text-black underline decoration-4 decoration-black dark:text-white"
												: "opacity-40"
									}`}
								>
									{balance.amount > 0
										? `+$${Math.abs(balance.amount).toFixed(2)}`
										: balance.amount < 0
											? `-$${Math.abs(balance.amount).toFixed(2)}`
											: "SETTLED"}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
