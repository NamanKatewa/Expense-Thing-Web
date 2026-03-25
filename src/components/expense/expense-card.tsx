import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { CATEGORY_ICONS, CATEGORY_LABELS, type Expense } from "~/types";

interface ExpenseCardProps {
	expense: Expense;
	currentUserId?: string;
	onEdit?: (expense: Expense) => void;
	onDelete?: (expense: Expense) => void;
	showGroupInfo?: boolean;
	groupName?: string;
}

export function ExpenseCard({
	expense,
	currentUserId,
	onEdit,
	onDelete,
	showGroupInfo = false,
	groupName,
}: ExpenseCardProps) {
	const [showDetails, _setShowDetails] = useState(false);

	const currentUserShare = expense.splits.find(
		(s) => s.userId === currentUserId,
	);

	const payer = expense.payers[0];

	return (
		<div className="group brutal-shadow relative border-2 border-black bg-white p-6 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-white dark:bg-black">
			<div className="flex items-start justify-between gap-6">
				<div className="flex min-w-0 flex-1 items-center gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black bg-[#F0F0F0] text-2xl dark:border-white dark:bg-zinc-900">
						{CATEGORY_ICONS[expense.category]}
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-baseline gap-2">
							<h3 className="truncate font-black font-sans text-black text-lg uppercase tracking-tight dark:text-white">
								{expense.description}
							</h3>
							{showGroupInfo && groupName && (
								<span className="font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
									IN {groupName.toUpperCase()}
								</span>
							)}
						</div>
						<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-black font-sans text-[10px] uppercase tracking-widest opacity-60">
							<span className="border-black border-b dark:border-white">
								{CATEGORY_LABELS[expense.category]}
							</span>
							<span>•</span>
							<span>
								{format(new Date(expense.date), "MMM d, yyyy").toUpperCase()}
							</span>
							{payer && (
								<>
									<span>•</span>
									<span className="bg-black px-1 text-white dark:bg-white dark:text-black">
										PAID BY {payer.user.name?.toUpperCase() || "UNKNOWN"}
									</span>
								</>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="text-right">
						<p className="font-bold font-serif text-2xl">
							${Number(expense.amount).toFixed(2)}
						</p>
						{currentUserShare && (
							<p className="font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
								SHARE: ${Number(currentUserShare.value).toFixed(2)}
							</p>
						)}
					</div>

					{(onEdit || onDelete) && (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<button className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-black hover:text-white dark:border-white dark:bg-black dark:hover:bg-white dark:hover:text-black">
										<MoreHorizontal className="h-4 w-4" />
									</button>
								}
							/>
							<DropdownMenuContent
								align="end"
								className="brutal-shadow rounded-none border-2 border-black dark:border-white"
							>
								{onEdit && (
									<DropdownMenuItem
										className="rounded-none font-black font-sans text-xs uppercase tracking-widest"
										onClick={() => onEdit(expense)}
									>
										<Pencil className="mr-2 h-4 w-4" />
										Edit
									</DropdownMenuItem>
								)}
								{onDelete && (
									<DropdownMenuItem
										className="rounded-none font-black font-sans text-destructive text-xs uppercase tracking-widest"
										onClick={() => onDelete(expense)}
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>

			{showDetails && (
				<div className="mt-6 border-black border-t-2 pt-6 dark:border-white">
					<h4 className="mb-4 font-black font-sans text-xs uppercase tracking-widest opacity-40">
						Split Details
					</h4>
					<div className="space-y-3">
						{expense.splits.map((split) => (
							<div className="flex items-center justify-between" key={split.id}>
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white font-black font-sans text-[10px] text-black uppercase dark:border-white dark:bg-black dark:text-white">
										{split.user.name?.[0] ?? "?"}
									</div>
									<span className="font-bold font-sans text-sm uppercase tracking-tight">
										{split.user.name || "Unknown"}
									</span>
								</div>
								<div className="text-right">
									<span className="font-bold font-serif">
										${Number(split.value).toFixed(2)}
									</span>
									<span className="ml-2 font-black font-sans text-[10px] uppercase tracking-widest opacity-40">
										{split.type}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
