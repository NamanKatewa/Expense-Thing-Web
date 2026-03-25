"use client";

import { format } from "date-fns";
import { CalendarIcon, Users } from "lucide-react";
import { useState } from "react";
import { MemberAvatar } from "~/components/common/member-avatar";
import { MemberSelector } from "~/components/common/member-selector";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Group, SplitType } from "~/types";
import { CATEGORY_LABELS } from "~/types";

interface AddExpenseModalProps {
	group: Group;
	trigger?: React.ReactElement;
	onSubmit?: (data: AddExpenseData) => void;
}

export interface AddExpenseData {
	description: string;
	amount: number;
	date: Date;
	category: string;
	payerId: string;
	splitType: SplitType;
	splitMembers: string[];
	splitValues: Record<string, number>;
}

const categories = Object.keys(CATEGORY_LABELS) as Array<
	keyof typeof CATEGORY_LABELS
>;

export function AddExpenseModal({
	group,
	trigger,
	onSubmit,
}: AddExpenseModalProps) {
	const [open, setOpen] = useState(false);
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState<Date>(new Date());
	const [category, setCategory] = useState("FOOD");
	const [payerId, setPayerId] = useState(group.members[0]?.userId || "");
	const [splitType, setSplitType] = useState<SplitType>("EQUAL");
	const [selectedMembers, setSelectedMembers] = useState<string[]>(
		group.members.map((m) => m.userId),
	);
	const [splitValues, setSplitValues] = useState<Record<string, number>>({});

	const resetForm = () => {
		setDescription("");
		setAmount("");
		setDate(new Date());
		setCategory("FOOD");
		setPayerId(group.members[0]?.userId || "");
		setSplitType("EQUAL");
		setSelectedMembers(group.members.map((m) => m.userId));
		setSplitValues({});
	};

	const handleSubmit = () => {
		if (!description || !amount || !payerId || selectedMembers.length === 0) {
			return;
		}

		const data: AddExpenseData = {
			description,
			amount: parseFloat(amount),
			date,
			category,
			payerId,
			splitType,
			splitMembers: selectedMembers,
			splitValues,
		};

		onSubmit?.(data);
		setOpen(false);
		resetForm();
	};

	const calculateEqualSplit = () => {
		const numMembers = selectedMembers.length;
		if (numMembers === 0) return 0;
		return parseFloat(amount) / numMembers;
	};

	const calculatePreviewValue = (userId: string) => {
		const totalAmount = parseFloat(amount) || 0;
		if (splitType === "EQUAL") {
			return calculateEqualSplit();
		}
		if (splitType === "EXACT") {
			return splitValues[userId] || 0;
		}
		if (splitType === "PERCENTAGE") {
			const percentage = splitValues[userId] || 0;
			return (percentage / 100) * totalAmount;
		}
		if (splitType === "SHARES") {
			const shares = splitValues[userId] || 0;
			const totalShares = selectedMembers.reduce(
				(sum, id) => sum + (splitValues[id] || 0),
				0,
			);
			return totalShares > 0 ? (shares / totalShares) * totalAmount : 0;
		}
		return 0;
	};

	const handleSplitValueChange = (userId: string, value: string) => {
		setSplitValues((prev) => ({ ...prev, [userId]: parseFloat(value) || 0 }));
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger render={trigger} />
			<DialogContent className="brutal-shadow max-h-[95vh] overflow-y-auto rounded-none border-4 border-black p-8 sm:max-w-[600px] dark:border-white dark:bg-black">
				<DialogHeader className="mb-6 border-black border-b-4 pb-6 dark:border-white">
					<DialogTitle className="font-bold font-serif text-5xl uppercase">
						Add Expense
					</DialogTitle>
					<DialogDescription className="font-bold font-sans uppercase tracking-widest opacity-60">
						Log A New Entry For {group.name}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-8 font-sans">
					<div className="space-y-3">
						<Label
							className="font-black text-xs uppercase tracking-[0.2em] opacity-70"
							htmlFor="description"
						>
							Description
						</Label>
						<Input
							className="h-12 rounded-none border-2 border-black font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black"
							id="description"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="WHAT WAS THIS FOR?"
							value={description}
						/>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-3">
							<Label
								className="font-black text-xs uppercase tracking-[0.2em] opacity-70"
								htmlFor="amount"
							>
								Amount ($)
							</Label>
							<Input
								className="h-12 rounded-none border-2 border-black font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:border-white dark:bg-black dark:text-white dark:focus:bg-white dark:focus:text-black"
								id="amount"
								min="0"
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
								step="0.01"
								type="number"
								value={amount}
							/>
						</div>

						<div className="space-y-3">
							<Label className="font-black text-xs uppercase tracking-[0.2em] opacity-70">
								Category
							</Label>
							<Select
								onValueChange={(val) => val && setCategory(val)}
								value={category}
							>
								<SelectTrigger className="brutal-shadow-sm h-12 rounded-none border-2 border-black font-bold uppercase tracking-widest dark:border-white">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="brutal-shadow rounded-none border-2 border-black dark:border-white dark:bg-black">
									{categories.map((cat) => (
										<SelectItem
											className="font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
											key={cat}
											value={cat}
										>
											{CATEGORY_LABELS[cat]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-3">
							<Label className="font-black text-xs uppercase tracking-[0.2em] opacity-70">
								Date
							</Label>
							<Popover>
								<PopoverTrigger
									render={
										<Button
											className="brutal-shadow-sm h-12 w-full justify-start rounded-none border-2 border-black font-bold uppercase tracking-widest dark:border-white"
											type="button"
											variant="outline"
										>
											<CalendarIcon className="mr-3 h-5 w-5 stroke-[3]" />
											{format(date, "MMM d, yyyy")}
										</Button>
									}
								/>
								<PopoverContent
									align="start"
									className="brutal-shadow w-auto rounded-none border-2 border-black p-0 dark:border-white"
								>
									<Calendar
										initialFocus
										mode="single"
										onSelect={(d) => d && setDate(d)}
										selected={date}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className="space-y-3">
							<Label className="font-black text-xs uppercase tracking-[0.2em] opacity-70">
								Paid By
							</Label>
							<Select
								onValueChange={(val) => val && setPayerId(val)}
								value={payerId}
							>
								<SelectTrigger className="brutal-shadow-sm h-12 rounded-none border-2 border-black font-bold uppercase tracking-widest dark:border-white">
									<SelectValue>
										{group.members.find((m) => m.userId === payerId)?.user
											.name || "SELECT PAYER"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="brutal-shadow rounded-none border-2 border-black dark:border-white dark:bg-black">
									{group.members.map((member) => (
										<SelectItem
											className="font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black"
											key={member.userId}
											value={member.userId}
										>
											<div className="flex items-center gap-3">
												<MemberAvatar
													image={member.user.image}
													name={member.user.name}
													size="sm"
												/>
												<span>{member.user.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<Separator className="my-8" />

					<div className="space-y-4">
						<Label className="font-black text-xs uppercase tracking-[0.2em] opacity-70">
							Split Strategy
						</Label>
						<Tabs
							className="w-full"
							onValueChange={(v) => setSplitType(v as SplitType)}
							value={splitType}
						>
							<TabsList className="grid w-full grid-cols-4 rounded-none border-2 border-black bg-white p-1 dark:border-white dark:bg-black">
								<TabsTrigger
									className="rounded-none font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
									value="EQUAL"
								>
									EQUAL
								</TabsTrigger>
								<TabsTrigger
									className="rounded-none font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
									value="EXACT"
								>
									EXACT
								</TabsTrigger>
								<TabsTrigger
									className="rounded-none font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
									value="PERCENTAGE"
								>
									%
								</TabsTrigger>
								<TabsTrigger
									className="rounded-none font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
									value="SHARES"
								>
									SHARES
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					<MemberSelector
						label="Target Recruits"
						members={group.members}
						onSelectionChange={setSelectedMembers}
						selectedIds={selectedMembers}
					/>

					{selectedMembers.length > 0 && (
						<div className="brutal-shadow-sm rounded-none border-4 border-black bg-zinc-50 p-6 dark:border-white dark:bg-zinc-900">
							<div className="mb-4 flex items-center gap-3 border-black/10 border-b-2 pb-2 dark:border-white/10">
								<Users className="h-5 w-5 stroke-[3] text-black dark:text-white" />
								<span className="font-black text-sm uppercase tracking-widest">
									Syndicate Preview
								</span>
							</div>
							<div className="space-y-4">
								{selectedMembers.map((memberId) => {
									const member = group.members.find(
										(m) => m.userId === memberId,
									);
									if (!member) return null;

									const value = calculatePreviewValue(memberId);

									return (
										<div
											className="flex items-center justify-between border-black/5 border-b pb-2 last:border-0 dark:border-white/5"
											key={memberId}
										>
											<div className="flex items-center gap-3">
												<MemberAvatar
													image={member.user.image}
													name={member.user.name}
													size="sm"
												/>
												<span className="font-bold text-xs uppercase tracking-tight">
													{member.user.name}
												</span>
											</div>
											<div className="flex items-center gap-4">
												{splitType !== "EQUAL" && (
													<div className="flex items-center gap-2">
														<Input
															className="h-8 w-20 rounded-none border-2 border-black text-right font-black dark:border-white dark:bg-black"
															onChange={(e) =>
																handleSplitValueChange(memberId, e.target.value)
															}
															placeholder="0"
															type="number"
															value={splitValues[memberId] || ""}
														/>
														<span className="w-12 font-black text-[10px] uppercase tracking-widest opacity-60">
															{splitType === "PERCENTAGE" ? "%" : "S"}
														</span>
													</div>
												)}
												<span className="min-w-[80px] text-right font-black text-sm tracking-tighter">
													${value.toFixed(2)}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="mt-10 gap-4">
					<Button
						className="h-12 rounded-none border-2 border-black font-black uppercase tracking-widest dark:border-white"
						onClick={() => setOpen(false)}
						variant="outline"
					>
						ABORT
					</Button>
					<Button
						className="brutal-shadow-sm h-12 rounded-none bg-black font-black text-white uppercase tracking-widest transition-colors hover:bg-[#E05D36] dark:bg-white dark:text-black dark:hover:bg-[#E05D36] dark:hover:text-white"
						disabled={!description || !amount}
						onClick={handleSubmit}
					>
						CONFIRM ENTRY
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
