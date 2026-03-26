import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const settlementRouter = createTRPCRouter({
	getAllByGroup: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.settlement.findMany({
				where: { groupId: input.groupId },
				include: {
					fromUser: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					toUser: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
				orderBy: { date: "desc" },
			});
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.settlement.findUnique({
				where: { id: input.id },
				include: {
					fromUser: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					toUser: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					group: true,
				},
			});
		}),

	create: protectedProcedure
		.input(
			z.object({
				groupId: z.string(),
				fromUserId: z.string(),
				toUserId: z.string(),
				amount: z.number().positive(),
				description: z.string().optional(),
				isPartial: z.boolean().optional(),
				remainingAmount: z.number().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const {
				groupId,
				fromUserId,
				toUserId,
				amount,
				description,
				isPartial,
				remainingAmount,
			} = input;

			const settlement = await ctx.db.settlement.create({
				data: {
					groupId,
					fromUserId,
					toUserId,
					amount,
					description,
					isPartial: isPartial ?? false,
					remainingAmount: remainingAmount,
				},
				include: {
					fromUser: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					toUser: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
			});

			await ctx.db.activity.create({
				data: {
					type: "SETTLEMENT_CREATED",
					userId: ctx.session.user.id,
					groupId,
				},
			});

			return settlement;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const settlement = await ctx.db.settlement.findUnique({
				where: { id: input.id },
			});

			if (settlement) {
				await ctx.db.activity.create({
					data: {
						type: "SETTLEMENT_DELETED",
						userId: ctx.session.user.id,
						groupId: settlement.groupId,
					},
				});
			}

			return ctx.db.settlement.delete({
				where: { id: input.id },
			});
		}),

	getSuggested: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ ctx, input }) => {
			const expenses = await ctx.db.expense.findMany({
				where: { groupId: input.groupId },
				include: {
					payers: true,
					splits: true,
				},
			});

			const balances: Record<string, number> = {};

			for (const expense of expenses) {
				for (const payer of expense.payers) {
					balances[payer.userId] =
						(balances[payer.userId] || 0) + Number(payer.amount);
				}

				for (const split of expense.splits) {
					balances[split.userId] =
						(balances[split.userId] || 0) - Number(split.value);
				}
			}

			const settlements = await ctx.db.settlement.findMany({
				where: { groupId: input.groupId },
			});

			for (const settlement of settlements) {
				balances[settlement.fromUserId] =
					(balances[settlement.fromUserId] || 0) + Number(settlement.amount);
				balances[settlement.toUserId] =
					(balances[settlement.toUserId] || 0) - Number(settlement.amount);
			}

			const creditors: { userId: string; amount: number }[] = [];
			const debtors: { userId: string; amount: number }[] = [];

			for (const [userId, balance] of Object.entries(balances)) {
				if (balance > 0.01) {
					creditors.push({ userId, amount: balance });
				} else if (balance < -0.01) {
					debtors.push({ userId, amount: Math.abs(balance) });
				}
			}

			creditors.sort((a, b) => b.amount - a.amount);
			debtors.sort((a, b) => b.amount - a.amount);

			const suggestedSettlements: {
				fromUserId: string;
				toUserId: string;
				amount: number;
			}[] = [];

			const userCache = new Map<
				string,
				{ id: string; name: string | null; image: string | null }
			>();
			const users = await ctx.db.user.findMany({
				where: {
					id: {
						in: [
							...creditors.map((c) => c.userId),
							...debtors.map((d) => d.userId),
						],
					},
				},
				select: { id: true, name: true, image: true },
			});
			for (const user of users) {
				userCache.set(user.id, user);
			}

			while (debtors.length > 0 && creditors.length > 0) {
				const debtor = debtors[0]!;
				const creditor = creditors[0]!;

				const amount = Math.min(debtor.amount, creditor.amount);

				if (amount > 0.01) {
					suggestedSettlements.push({
						fromUserId: debtor.userId,
						toUserId: creditor.userId,
						amount: Math.round(amount * 100) / 100,
					});
				}

				debtor.amount -= amount;
				creditor.amount -= amount;

				if (debtor.amount < 0.01) {
					debtors.shift();
				}
				if (creditor.amount < 0.01) {
					creditors.shift();
				}
			}

			return suggestedSettlements.map((s) => ({
				...s,
				fromUser: userCache.get(s.fromUserId) ?? null,
				toUser: userCache.get(s.toUserId) ?? null,
			}));
		}),
});
