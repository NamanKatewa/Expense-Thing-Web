"use client";

import { Check } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { GroupMember } from "~/types";

interface MemberSelectorProps {
	members: GroupMember[];
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
	label?: string;
}

export function MemberSelector({
	members,
	selectedIds,
	onSelectionChange,
	label = "Select members",
}: MemberSelectorProps) {
	const [open, setOpen] = React.useState(false);

	const selectedMembers = members.filter((m) => selectedIds.includes(m.userId));
	const allSelected =
		members.length > 0 && selectedIds.length === members.length;

	const handleToggle = (userId: string) => {
		if (selectedIds.includes(userId)) {
			onSelectionChange(selectedIds.filter((id) => id !== userId));
		} else {
			onSelectionChange([...selectedIds, userId]);
		}
	};

	const handleSelectAll = () => {
		if (allSelected) {
			onSelectionChange([]);
		} else {
			onSelectionChange(members.map((m) => m.userId));
		}
	};

	return (
		<div className="space-y-4 font-sans">
			<Label className="font-black text-xs uppercase tracking-[0.2em] opacity-70">
				{label}
			</Label>
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger
					render={
						<Button
							className="brutal-shadow-sm h-12 w-full justify-between rounded-none border-2 border-black font-bold uppercase tracking-widest dark:border-white"
							type="button"
							variant="outline"
						>
							{selectedMembers.length === 0
								? label
								: `${selectedMembers.length} RECRUITS SELECTED`}
							<span className="ml-2 font-black">▼</span>
						</Button>
					}
				/>
				<PopoverContent
					align="start"
					className="brutal-shadow w-80 rounded-none border-2 border-black p-0 dark:border-white dark:bg-black"
				>
					<div className="flex items-center justify-between border-black border-b-2 p-4 dark:border-white">
						<Label className="font-bold text-xs uppercase tracking-widest opacity-60">
							{selectedIds.length} / {members.length} SELECTED
						</Label>
						<Button
							className="h-auto p-0 font-black text-xs uppercase tracking-widest hover:underline"
							onClick={handleSelectAll}
							size="sm"
							variant="ghost"
						>
							{allSelected ? "DESELECT" : "SELECT ALL"}
						</Button>
					</div>
					<ScrollArea className="h-72 p-2">
						<div className="space-y-1">
							{members.map((member) => (
								<button
									className="flex w-full cursor-pointer items-center gap-4 border-2 border-transparent p-3 text-left transition-colors hover:border-black hover:bg-zinc-100 dark:hover:border-white dark:hover:bg-zinc-900"
									key={member.userId}
									onClick={() => handleToggle(member.userId)}
									type="button"
								>
									<Checkbox
										checked={selectedIds.includes(member.userId)}
										onCheckedChange={() => handleToggle(member.userId)}
									/>
									<Avatar className="brutal-shadow-sm h-10 w-10 border-2 border-black dark:border-white">
										<AvatarImage src={member.user.image ?? undefined} />
										<AvatarFallback className="bg-white font-black text-sm dark:bg-zinc-800">
											{member.user.name?.[0] ?? "?"}
										</AvatarFallback>
									</Avatar>
									<span className="flex-1 truncate font-bold text-sm uppercase tracking-tight">
										{member.user.name}
									</span>
									{selectedIds.includes(member.userId) && (
										<Check className="h-5 w-5 stroke-[3]" />
									)}
								</button>
							))}
						</div>
					</ScrollArea>
				</PopoverContent>
			</Popover>
			{selectedIds.length > 0 && (
				<div className="flex flex-wrap gap-2 pt-2">
					{selectedMembers.map((member) => (
						<div
							className="brutal-shadow-sm flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 dark:border-white dark:bg-zinc-950"
							key={member.userId}
						>
							<Avatar className="h-6 w-6 border border-black dark:border-white">
								<AvatarImage src={member.user.image ?? undefined} />
								<AvatarFallback className="font-black text-[10px]">
									{member.user.name?.[0] ?? "?"}
								</AvatarFallback>
							</Avatar>
							<span className="font-black text-[10px] uppercase tracking-widest">
								{member.user.name}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
