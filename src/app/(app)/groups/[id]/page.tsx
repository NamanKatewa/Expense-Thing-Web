"use client";

import { ArrowLeft, Download, FileDown, Plus, Trash2, Users, Wallet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BalanceSummary } from "~/components/common/balance-summary";
import { ConfirmModal } from "~/components/common/confirm-modal";
import {
	CreateSettlementModal,
	type SettlementSuggestion,
} from "~/components/common/create-settlement-modal";
import { AddExpenseModal } from "~/components/expense/add-expense-modal";
import { ExpenseCard } from "~/components/expense/expense-card";
import { AddMemberModal } from "~/components/group/add-member-modal";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { CATEGORY_LABELS } from "~/types";
import type { Balance, Expense, Group, User } from "~/types";

export default function GroupDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const { data: session } = useSession();
	const utils = api.useUtils();

	const [showAddMember, setShowAddMember] = useState(false);
	const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
	const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
	const [showSettlementModal, setShowSettlementModal] =
		useState<SettlementSuggestion | null>(null);

	const { data: group, isLoading } = api.group.getById.useQuery({ id });

	const addExpenseMutation = api.expense.create.useMutation({
		onSuccess: () => {
			void utils.group.getById.invalidate({ id });
			void utils.dashboard.invalidate();
		},
	});

	const deleteExpenseMutation = api.expense.delete.useMutation({
		onSuccess: () => {
			void utils.group.getById.invalidate({ id });
			void utils.dashboard.invalidate();
		},
	});

	const deleteGroupMutation = api.group.delete.useMutation({
		onSuccess: () => {
			void utils.group.getAll.invalidate();
			void utils.dashboard.invalidate();
			window.location.href = "/groups";
		},
	});

	const handleDeleteGroup = () => {
		deleteGroupMutation.mutate({ id });
	};

	const handleDeleteExpense = () => {
		if (expenseToDelete) {
			deleteExpenseMutation.mutate({ id: expenseToDelete.id });
			setExpenseToDelete(null);
		}
	};

	const exportSyndicateReport = () => {
		if (!group) return;

		const doc = new jsPDF();
		const timestamp = new Date().toLocaleString();
		const balances = calculateBalances();
		
		const totalSpent = group.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

		// --- BRUTAL STYLING CONFIG ---
		const BRUTAL_BLACK = [0, 0, 0];
		const BRUTAL_WHITE = [255, 255, 255];
		const ACCENT_ORANGE = [224, 93, 54]; // #E05D36
		const ACCENT_GREEN = [177, 209, 130]; // #B1D182

		// 1. HEADER BRANDING
		doc.setFillColor(...BRUTAL_BLACK);
		doc.rect(14, 10, 40, 8, "F");
		doc.setFontSize(8);
		doc.setTextColor(...BRUTAL_WHITE);
		doc.setFont("helvetica", "bold");
		doc.text("EXPENSE THING", 17, 15.5);

		// 2. MAIN TITLE (BRUTALIST STYLE)
		doc.setTextColor(...BRUTAL_BLACK);
		doc.setFontSize(32);
		doc.setFont("times", "bold"); // Serif for titles
		doc.text(group.name.toUpperCase() + ".", 14, 35);

		// 3. METADATA BOX
		doc.setLineWidth(1.5);
		doc.setDrawColor(...BRUTAL_BLACK);
		doc.line(14, 40, 196, 40);
		
		doc.setFontSize(7);
		doc.setFont("helvetica", "bold");
		doc.text(`OPERATIVE: ${session?.user?.name?.toUpperCase() || "SYSTEM"}`, 14, 45);
		doc.text(`GENERATED: ${timestamp.toUpperCase()}`, 14, 49);

		// 4. FINANCIAL SUMMARY (SHADOW BOX)
		doc.setFillColor(...BRUTAL_BLACK);
		doc.rect(142, 22, 54, 20, "F"); // Shadow
		doc.setFillColor(...ACCENT_ORANGE);
		doc.rect(140, 20, 54, 20, "F");
		doc.setLineWidth(1);
		doc.rect(140, 20, 54, 20, "S");
		
		doc.setTextColor(...BRUTAL_BLACK);
		doc.setFontSize(8);
		doc.setFont("helvetica", "bold");
		doc.text("TOTAL BURN", 144, 26);
		doc.setFontSize(16);
		doc.setFont("times", "bold");
		doc.text(`$${totalSpent.toFixed(2)}`, 144, 34);

		// 5. STANDINGS SECTION
		doc.setFontSize(14);
		doc.setFont("times", "bold");
		doc.text("CURRENT STANDINGS.", 14, 70);

		autoTable(doc, {
			startY: 75,
			head: [["OPERATIVE", "ROLE", "NET BALANCE", "STATUS"]],
			body: balances.map((b) => {
				const role = group.members.find(m => m.userId === b.userId)?.role || "MEMBER";
				return [
					b.user.name?.toUpperCase() || "UNKNOWN",
					role.toUpperCase(),
					`${b.amount >= 0 ? "+" : ""}${Number(b.amount).toFixed(2)}`,
					b.amount >= 0 ? "CREDITOR" : "DEBTOR"
				];
			}),
			theme: "plain",
			headStyles: { 
				fillColor: BRUTAL_BLACK, 
				textColor: BRUTAL_WHITE, 
				fontStyle: "bold",
				fontSize: 9,
				cellPadding: 4
			},
			bodyStyles: { 
				textColor: BRUTAL_BLACK,
				fontSize: 9,
				lineWidth: 0.5,
				lineColor: BRUTAL_BLACK,
				cellPadding: 4
			},
			styles: { font: "helvetica" },
			columnStyles: {
				2: { fontStyle: "bold" },
				3: { fontStyle: "bold" }
			}
		});

		// 6. LEDGER SECTION
		let finalY = (doc as any).lastAutoTable.finalY || 80;
		doc.setFontSize(14);
		doc.setFont("times", "bold");
		doc.text("LEDGER RECORD.", 14, finalY + 15);

		autoTable(doc, {
			startY: finalY + 20,
			head: [["DATE", "DESCRIPTION", "CATEGORY", "PAID BY", "AMOUNT"]],
			body: group.expenses.map((e) => [
				new Date(e.date).toLocaleDateString().toUpperCase(),
				e.description.toUpperCase(),
				CATEGORY_LABELS[e.category].toUpperCase(),
				e.payers[0]?.user.name?.toUpperCase() || "UNKNOWN",
				`$${Number(e.amount).toFixed(2)}`,
			]),
			theme: "plain",
			headStyles: { 
				fillColor: BRUTAL_BLACK, 
				textColor: BRUTAL_WHITE, 
				fontStyle: "bold",
				fontSize: 8,
				cellPadding: 4
			},
			bodyStyles: { 
				textColor: BRUTAL_BLACK,
				fontSize: 8,
				lineWidth: 0.5,
				lineColor: BRUTAL_BLACK,
				cellPadding: 4
			},
			styles: { font: "helvetica" },
			alternateRowStyles: { fillColor: [240, 240, 240] }
		});

		// 7. SETTLEMENTS SECTION
		finalY = (doc as any).lastAutoTable.finalY || 100;
		if (group.settlements.length > 0) {
			if (finalY > 230) { doc.addPage(); finalY = 20; }
			
			doc.setFontSize(14);
			doc.setFont("times", "bold");
			doc.text("SETTLEMENTS.", 14, finalY + 15);

			autoTable(doc, {
				startY: finalY + 22,
				head: [["DATE", "FROM", "TO", "AMOUNT", "NOTE"]],
				body: group.settlements.map((s) => [
					new Date(s.date).toLocaleDateString().toUpperCase(),
					s.fromUser.name?.toUpperCase() || "UNKNOWN",
					s.toUser.name?.toUpperCase() || "UNKNOWN",
					`$${Number(s.amount).toFixed(2)}`,
					s.description?.toUpperCase() || "-"
				]),
				theme: "plain",
				headStyles: { 
					fillColor: BRUTAL_BLACK, 
					textColor: BRUTAL_WHITE, 
					fontStyle: "bold",
					fontSize: 8,
					cellPadding: 4
				},
				bodyStyles: { 
					textColor: BRUTAL_BLACK,
					fontSize: 8,
					lineWidth: 0.5,
					lineColor: BRUTAL_BLACK,
					cellPadding: 4
				},
				styles: { font: "helvetica" }
			});
		}

		// 8. FOOTER
		const pageCount = (doc as any).internal.getNumberOfPages();
		for(let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setLineWidth(1.5);
			doc.setDrawColor(...BRUTAL_BLACK);
			doc.line(14, 280, 196, 280);
			doc.setFontSize(7);
			doc.setFont("helvetica", "bold");
			doc.setTextColor(...BRUTAL_BLACK);
			doc.text(`EXPENSE THING SYSTEM RECORD // PAGE ${i} OF ${pageCount} // [END_OF_FILE]`, 14, 286);
		}

		doc.save(`${group.name.toLowerCase().replace(/\s+/g, "-")}-report.pdf`);
	};

	const exportMemberSummary = () => {
		if (!group) return;

		const doc = new jsPDF();
		const timestamp = new Date().toLocaleString();
		
		const BRUTAL_BLACK = [0, 0, 0];
		const BRUTAL_WHITE = [255, 255, 255];
		const ACCENT_YELLOW = [255, 217, 61]; // #FFD93D

		// Brand Header
		doc.setFillColor(...BRUTAL_BLACK);
		doc.rect(14, 10, 40, 8, "F");
		doc.setFontSize(8);
		doc.setTextColor(...BRUTAL_WHITE);
		doc.setFont("helvetica", "bold");
		doc.text("EXPENSE THING", 17, 15.5);

		// Header
		doc.setTextColor(...BRUTAL_BLACK);
		doc.setFontSize(28);
		doc.setFont("times", "bold");
		doc.text(group.name.toUpperCase() + ".", 14, 35);
		
		doc.setFontSize(9);
		doc.setFont("helvetica", "bold");
		doc.text(`OPERATIVE DIRECTORY | GENERATED: ${timestamp.toUpperCase()}`, 14, 43);

		// Line
		doc.setLineWidth(1.5);
		doc.setDrawColor(...BRUTAL_BLACK);
		doc.line(14, 48, 196, 48);

		// Summary Box (Yellow)
		doc.setFillColor(...BRUTAL_BLACK);
		doc.rect(142, 22, 54, 15, "F"); // Shadow
		doc.setFillColor(...ACCENT_YELLOW);
		doc.rect(140, 20, 54, 15, "F");
		doc.setLineWidth(1);
		doc.rect(140, 20, 54, 15, "S");
		
		doc.setTextColor(...BRUTAL_BLACK);
		doc.setFontSize(8);
		doc.setFont("helvetica", "bold");
		doc.text("TOTAL OPERATIVES", 144, 26);
		doc.setFontSize(14);
		doc.setFont("times", "bold");
		doc.text(`${group.members.length} MEMBERS`, 144, 32);

		// Members Section
		doc.setTextColor(...BRUTAL_BLACK);
		doc.setFontSize(14);
		doc.setFont("times", "bold");
		doc.text("ACTIVE OPERATIVES.", 14, 65);

		autoTable(doc, {
			startY: 70,
			head: [["NAME", "EMAIL", "ROLE", "JOINED"]],
			body: group.members.map((m) => [
				m.user.name?.toUpperCase() || "UNKNOWN",
				m.user.email || "N/A",
				m.role.toUpperCase(),
				m.joinedAt ? new Date(m.joinedAt).toLocaleDateString().toUpperCase() : "N/A"
			]),
			theme: "plain",
			headStyles: { 
				fillColor: BRUTAL_BLACK, 
				textColor: BRUTAL_WHITE, 
				fontStyle: "bold",
				fontSize: 9,
				cellPadding: 4
			},
			bodyStyles: { 
				textColor: BRUTAL_BLACK,
				fontSize: 9,
				lineWidth: 0.5,
				lineColor: BRUTAL_BLACK,
				cellPadding: 4
			},
			styles: { font: "helvetica" }
		});

		// Footer
		doc.setLineWidth(1.5);
		doc.setDrawColor(...BRUTAL_BLACK);
		doc.line(14, 280, 196, 280);
		doc.setFontSize(7);
		doc.setFont("helvetica", "bold");
		doc.text(`EXPENSE THING SYSTEM RECORD // OPERATIVE_DIRECTORY // [END_OF_FILE]`, 14, 286);

		doc.save(`${group.name.toLowerCase().replace(/\s+/g, "-")}-operatives.pdf`);
	};

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<div className="flex flex-col items-center gap-6">
					<div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
					<p className="font-black font-sans text-sm uppercase tracking-[0.2em] opacity-40">
						RETRIVING RECORDS...
					</p>
				</div>
			</div>
		);
	}

	if (!group) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<h1 className="font-bold font-serif text-6xl uppercase">
					404 / NOT FOUND
				</h1>
				<p className="mt-4 font-bold font-sans text-xl uppercase tracking-widest opacity-60">
					This cell does not exist or has been purged.
				</p>
				<Link
					className="mt-10 border-4 border-black bg-black px-10 py-5 font-black font-sans text-lg text-white uppercase tracking-widest transition-all hover:bg-white hover:text-black dark:border-white"
					href="/groups"
				>
					Return to Groups
				</Link>
			</div>
		);
	}

	// Calculate balances locally for the BalanceSummary component
	const calculateBalances = (): Balance[] => {
		const balanceMap: Record<
			string,
			{ userId: string; user: User; amount: number }
		> = {};

		// Initialize with all members
		for (const member of group.members) {
			balanceMap[member.userId] = {
				userId: member.userId,
				user: member.user,
				amount: 0,
			};
		}

		// Process expenses
		for (const expense of group.expenses) {
			for (const payer of expense.payers) {
				if (balanceMap[payer.userId]) {
					balanceMap[payer.userId]!.amount += Number(payer.amount);
				}
			}
			for (const split of expense.splits) {
				if (balanceMap[split.userId]) {
					balanceMap[split.userId]!.amount -= Number(split.value);
				}
			}
		}

		// Process settlements
		for (const settlement of group.settlements) {
			if (balanceMap[settlement.fromUserId]) {
				balanceMap[settlement.fromUserId]!.amount += Number(settlement.amount);
			}
			if (balanceMap[settlement.toUserId]) {
				balanceMap[settlement.toUserId]!.amount -= Number(settlement.amount);
			}
		}

		return Object.values(balanceMap);
	};

	const balances = calculateBalances();

	return (
		<div className="space-y-16 py-8 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
			<div className="flex flex-col gap-8 border-black border-b-8 pb-8 dark:border-white">
				<Link
					className="inline-flex items-center gap-2 font-black font-sans text-xs uppercase tracking-[0.2em] opacity-60 transition-opacity hover:opacity-100"
					href="/groups"
				>
					<ArrowLeft className="h-4 w-4 stroke-[3]" />
					All Associations
				</Link>
				<div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
					<div className="max-w-4xl">
						<h1 className="font-bold font-serif text-[clamp(3.5rem,10vw,8rem)] uppercase leading-[0.85] tracking-tighter">
							{group.name}.
						</h1>
						{group.description && (
							<p className="mt-6 font-bold font-sans text-xl uppercase tracking-[0.15em] opacity-80">
								{group.description}
							</p>
						)}
					</div>
					<div className="flex flex-wrap gap-4">
						<AddExpenseModal
							group={group as unknown as Group}
							onSubmit={(data) => {
								const totalAmount = data.amount;

								let splits: {
									userId: string;
									type: typeof data.splitType;
									value: number;
								}[] = [];

								if (data.splitType === "EQUAL") {
									const numMembers = data.splitMembers.length;
									const equalValue = totalAmount / numMembers;
									splits = data.splitMembers.map((userId) => ({
										userId,
										type: data.splitType,
										value: equalValue,
									}));
								} else if (data.splitType === "PERCENTAGE") {
									splits = data.splitMembers.map((userId) => {
										const percentage = data.splitValues[userId] ?? 0;
										const value = (percentage / 100) * totalAmount;
										return {
											userId,
											type: data.splitType,
											value: value > 0 ? value : 0.01,
										};
									});
								} else if (data.splitType === "SHARES") {
									const totalShares = data.splitMembers.reduce(
										(sum, userId) => sum + (data.splitValues[userId] ?? 0),
										0,
									);
									splits = data.splitMembers.map((userId) => {
										const shares = data.splitValues[userId] ?? 0;
										const value =
											totalShares > 0
												? (shares / totalShares) * totalAmount
												: 0;
										return {
											userId,
											type: data.splitType,
											value: value > 0 ? value : 0.01,
										};
									});
								} else {
									// EXACT
									splits = data.splitMembers.map((userId) => ({
										userId,
										type: data.splitType,
										value: data.splitValues[userId] ?? 0,
									}));
								}

								addExpenseMutation.mutate({
									groupId: group.id,
									description: data.description,
									amount: data.amount,
									date: data.date,
									category: data.category as Expense["category"],
									payerId: data.payerId,
									payerAmount: data.amount,
									splits: splits,
								});
							}}
							trigger={
								<button className="brutal-shadow flex items-center justify-center gap-3 border-4 border-black bg-[#E05D36] px-8 py-4 font-black font-sans text-black text-lg uppercase tracking-widest transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black">
									<Plus className="h-6 w-6 stroke-[3]" />
									Log Entry
								</button>
							}
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
				<div className="space-y-16 lg:col-span-2">
					<Tabs defaultValue="balances">
						<TabsList className="mb-12 w-full justify-start gap-8 bg-transparent p-0" variant="line">
							<TabsTrigger className="px-0 py-4 font-bold font-serif text-3xl uppercase tracking-tighter data-[active]:text-black dark:data-[active]:text-white" value="balances">
								Balances.
							</TabsTrigger>
							<TabsTrigger className="px-0 py-4 font-bold font-serif text-3xl uppercase tracking-tighter data-[active]:text-black dark:data-[active]:text-white" value="ledger">
								Ledger.
							</TabsTrigger>
							<TabsTrigger className="px-0 py-4 font-bold font-serif text-3xl uppercase tracking-tighter data-[active]:text-black dark:data-[active]:text-white" value="export">
								Export.
							</TabsTrigger>
						</TabsList>

						<TabsContent className="space-y-12" value="balances">
							<BalanceSummary
								balances={balances}
								currentUserId={session?.user?.id}
								onSettle={(user, amount) => {
									setShowSettlementModal({
										fromUserId: session?.user?.id || "",
										toUserId: user.id,
										amount,
										fromUser: {
											id: session?.user?.id || "",
											name: session?.user?.name || null,
											image: session?.user?.image || null,
										},
										toUser: {
											id: user.id,
											name: user.name || null,
											image: user.image || null,
										},
									});
								}}
							/>
						</TabsContent>

						<TabsContent value="ledger">
							<div className="mb-8 flex items-center justify-between border-black border-b-4 pb-4 dark:border-white">
								<h2 className="font-bold font-serif text-4xl uppercase">
									Records
								</h2>
								<span className="font-black font-sans text-xs uppercase tracking-widest opacity-40">
									{group.expenses.length} TOTAL ENTRIES
								</span>
							</div>

							<div className="space-y-6">
								{group.expenses.length > 0 ? (
									group.expenses.map((expense) => (
										<ExpenseCard
											currentUserId={session?.user?.id}
											expense={expense as unknown as Expense}
											key={expense.id}
											onDelete={(e) => setExpenseToDelete(e)}
										/>
									))
								) : (
									<div className="border-4 border-black border-dashed py-24 text-center dark:border-white">
										<p className="font-bold font-sans text-lg uppercase tracking-widest opacity-40">
											The Ledger is empty. No debts recorded.
										</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="export">
							<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
								<div className="brutal-shadow border-4 border-black bg-[#B1D182] p-8 dark:border-white dark:text-black">
									<FileDown className="mb-4 h-12 w-12 stroke-[2.5]" />
									<h3 className="font-bold font-serif text-3xl uppercase leading-tight">
										Syndicate Report
									</h3>
									<p className="mt-2 font-bold font-sans text-xs uppercase tracking-widest opacity-70">
										Export all standings, ledger entries, and historical data for this association.
									</p>
									<button
										className="mt-8 flex w-full items-center justify-center gap-3 border-4 border-black bg-black py-4 font-black font-sans text-sm text-white uppercase tracking-widest transition-all hover:bg-white hover:text-black dark:border-white"
										onClick={exportSyndicateReport}
									>
										<Download className="h-5 w-5" />
										Download PDF
									</button>
								</div>

								<div className="brutal-shadow border-4 border-black bg-[#FFD93D] p-8 dark:border-white dark:text-black">
									<Users className="mb-4 h-12 w-12 stroke-[2.5]" />
									<h3 className="font-bold font-serif text-3xl uppercase leading-tight">
										Member Summary
									</h3>
									<p className="mt-2 font-bold font-sans text-xs uppercase tracking-widest opacity-70">
										Export a list of active operatives and their contact information.
									</p>
									<button
										className="mt-8 flex w-full items-center justify-center gap-3 border-4 border-black bg-black py-4 font-black font-sans text-sm text-white uppercase tracking-widest transition-all hover:bg-white hover:text-black dark:border-white"
										onClick={exportMemberSummary}
									>
										<Download className="h-5 w-5" />
										Download PDF
									</button>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</div>

				<div className="space-y-12">
					<section className="brutal-shadow border-4 border-black bg-white p-8 dark:border-white dark:bg-zinc-950">
						<div className="mb-8 flex items-center gap-4 border-black border-b-2 pb-4 dark:border-white">
							<Users className="h-6 w-6 stroke-[3]" />
							<h3 className="font-black font-sans text-sm uppercase tracking-[0.2em]">
								Active Operatives
							</h3>
						</div>
						<div className="space-y-6">
							{group.members.map((member) => (
								<div
									className="flex items-center justify-between"
									key={member.id}
								>
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-black font-black font-sans text-lg text-white dark:border-white dark:bg-white dark:text-black">
											{member.user.name?.[0]?.toUpperCase() ?? "U"}
										</div>
										<div className="font-sans">
											<p className="font-black text-sm uppercase leading-none tracking-tighter">
												{member.user.name}
											</p>
											<p className="mt-1 font-bold text-[10px] uppercase tracking-widest opacity-40">
												{member.role}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
						<button
							className="mt-10 w-full border-2 border-black bg-zinc-100 py-4 font-black font-sans text-xs uppercase tracking-widest transition-all hover:bg-black hover:text-white dark:border-white dark:bg-zinc-900"
							onClick={() => setShowAddMember(true)}
						>
							Enlist Operative
						</button>
					</section>

					<section className="brutal-shadow border-4 border-black bg-black p-8 text-white dark:border-white dark:bg-white dark:text-black">
						<h3 className="border-white/20 border-b pb-4 font-black font-sans text-sm uppercase tracking-[0.2em] dark:border-black/20">
							Summary
						</h3>
						<div className="mt-6 space-y-4 font-bold font-sans text-sm uppercase tracking-widest">
							<div className="flex justify-between">
								<span className="opacity-60">Total Burn</span>
								<span className="font-serif text-lg">
									$
									{group.expenses
										.reduce((sum, e) => sum + Number(e.amount), 0)
										.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="opacity-60">Settlements</span>
								<span className="font-serif text-lg">
									$
									{group.settlements
										.reduce((sum, s) => sum + Number(s.amount), 0)
										.toFixed(2)}
								</span>
							</div>
						</div>
					</section>

					<div className="pt-8">
						<button
							className="brutal-shadow flex w-full items-center justify-center gap-3 border-4 border-black bg-white py-4 font-black font-sans text-black text-sm uppercase tracking-widest transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white dark:border-white dark:bg-black dark:hover:bg-red-600 dark:hover:text-white"
							onClick={() => setShowDeleteGroupConfirm(true)}
						>
							<Trash2 className="h-5 w-5 stroke-[2]" />
							Purge Association
						</button>
					</div>
				</div>
			</div>

			{showDeleteGroupConfirm && (
				<ConfirmModal
					confirmText="PURGE GROUP"
					description="Are you sure you want to permanently delete this group? All expenses and settlements will be lost forever."
					onClose={() => setShowDeleteGroupConfirm(false)}
					onConfirm={handleDeleteGroup}
					title="DELETE GROUP"
				/>
			)}

			{expenseToDelete && (
				<ConfirmModal
					confirmText="DELETE EXPENSE"
					description={`Are you sure you want to delete expense "${expenseToDelete.description}"?`}
					onClose={() => setExpenseToDelete(null)}
					onConfirm={handleDeleteExpense}
					title="DELETE EXPENSE"
				/>
			)}

			{showAddMember && (
				<AddMemberModal
					groupId={id}
					onClose={() => setShowAddMember(false)}
					onSuccess={() => {
						void utils.group.getById.invalidate({ id });
						void utils.dashboard.invalidate();
					}}
				/>
			)}

			{showSettlementModal && (
				<CreateSettlementModal
					groupId={id}
					onClose={() => setShowSettlementModal(null)}
					onSuccess={() => {
						void utils.group.getById.invalidate({ id });
						void utils.dashboard.invalidate();
					}}
					suggestion={showSettlementModal}
				/>
			)}
		</div>
	);
}
