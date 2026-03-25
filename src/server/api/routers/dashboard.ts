import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
	getOverview: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// 1. Get groups user belongs to
		const userGroups = await ctx.db.group.findMany({
			where: {
				members: {
					some: { userId },
				},
			},
			select: {
				id: true,
			},
		});

		const groupIds = userGroups.map((g) => g.id);

		// 2. Fetch stats and data in parallel
		const [
			totalGroups,
			totalExpenses,
			pendingSettlements,
			expenses,
			userPaidExpenses,
			userExpensesForOwed,
			settlementsFrom,
			settlementsTo,
		] = await Promise.all([
			ctx.db.group.count({
				where: { id: { in: groupIds } },
			}),
			ctx.db.expense.count({
				where: { groupId: { in: groupIds } },
			}),
			ctx.db.settlement.count({
				where: {
					groupId: { in: groupIds },
					isPartial: true,
				},
			}),
			// Fetch all expenses in these groups for breakdown and recent activity
			ctx.db.expense.findMany({
				where: { groupId: { in: groupIds } },
				include: {
					group: {
						select: {
							id: true,
							name: true,
						},
					},
					createdBy: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
				orderBy: { date: "desc" },
			}),
			// Get what user paid
			ctx.db.expensePayer.findMany({
				where: {
					userId,
					expense: {
						groupId: { in: groupIds },
					},
				},
				select: {
					amount: true,
				},
			}),
			// Get what user owes (splits)
			ctx.db.expense.findMany({
				where: {
					groupId: { in: groupIds },
					splits: {
						some: { userId },
					},
				},
				select: {
					splits: {
						where: { userId },
						select: {
							value: true,
						},
					},
				},
			}),
			// Get settlements paid by user
			ctx.db.settlement.findMany({
				where: {
					fromUserId: userId,
					groupId: { in: groupIds },
				},
				select: {
					amount: true,
				},
			}),
			// Get settlements received by user
			ctx.db.settlement.findMany({
				where: {
					toUserId: userId,
					groupId: { in: groupIds },
				},
				select: {
					amount: true,
				},
			}),
		]);

		// 3. Process data in JS
		const userPaid = userPaidExpenses.reduce(
			(sum, p) => sum + Number(p.amount),
			0,
		);

		const userOwes = userExpensesForOwed.reduce((sum, exp) => {
			const userSplit = exp.splits[0];
			return sum + (userSplit ? Number(userSplit.value) : 0);
		}, 0);

		const totalSettledFrom = settlementsFrom.reduce(
			(sum, s) => sum + Number(s.amount),
			0,
		);

		const totalSettledTo = settlementsTo.reduce(
			(sum, s) => sum + Number(s.amount),
			0,
		);

		const balance = userPaid - userOwes + totalSettledFrom - totalSettledTo;

		const totalSpent = expenses.reduce(
			(sum, exp) => sum + Number(exp.amount),
			0,
		);

		const categoryBreakdown: Record<string, number> = {};
		for (const expense of expenses) {
			categoryBreakdown[expense.category] =
				(categoryBreakdown[expense.category] || 0) + Number(expense.amount);
		}

		return {
			totalGroups,
			totalExpenses,
			totalSpent: Math.round(userPaid * 100) / 100, // Now user spending
			groupSpent: Math.round(totalSpent * 100) / 100, // Added for completeness
			balance: Math.round(balance * 100) / 100,
			pendingSettlements,
			recentExpenses: expenses.slice(0, 5),
			categoryBreakdown: Object.entries(categoryBreakdown).map(
				([category, amount]) => ({
					category,
					amount: Math.round(amount * 100) / 100,
				}),
			),
		};
	}),

	getStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const userGroups = await ctx.db.group.findMany({
			where: {
				members: {
					some: { userId },
				},
			},
			select: {
				id: true,
			},
		});

		const groupIds = userGroups.map((g) => g.id);

		const [
			totalGroups,
			totalExpenses,
			recentExpenses,
			pendingSettlements,
			userPaidExpenses,
			userExpensesForOwed,
			settlementsFrom,
			settlementsTo,
		] = await Promise.all([
			ctx.db.group.count({
				where: { id: { in: groupIds } },
			}),

			ctx.db.expense.count({
				where: { groupId: { in: groupIds } },
			}),

			ctx.db.expense.findMany({
				where: { groupId: { in: groupIds } },
				include: {
					group: {
						select: {
							id: true,
							name: true,
						},
					},
					createdBy: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
				orderBy: { date: "desc" },
				take: 5,
			}),

			ctx.db.settlement.count({
				where: {
					groupId: { in: groupIds },
					isPartial: true,
				},
			}),

			ctx.db.expensePayer.findMany({
				where: {
					userId,
					expense: {
						groupId: { in: groupIds },
					},
				},
				select: {
					amount: true,
				},
			}),

			ctx.db.expense.findMany({
				where: {
					groupId: { in: groupIds },
					splits: {
						some: { userId },
					},
				},
				select: {
					splits: {
						where: { userId },
						select: {
							value: true,
						},
					},
				},
			}),

			ctx.db.settlement.findMany({
				where: {
					fromUserId: userId,
					groupId: { in: groupIds },
				},
				select: {
					amount: true,
				},
			}),

			ctx.db.settlement.findMany({
				where: {
					toUserId: userId,
					groupId: { in: groupIds },
				},
				select: {
					amount: true,
				},
			}),
		]);

		const userPaid = userPaidExpenses.reduce(
			(sum, p) => sum + Number(p.amount),
			0,
		);

		const userOwes = userExpensesForOwed.reduce((sum, exp) => {
			const userSplit = exp.splits[0];
			return sum + (userSplit ? Number(userSplit.value) : 0);
		}, 0);

		const totalSettledFrom = settlementsFrom.reduce(
			(sum, s) => sum + Number(s.amount),
			0,
		);

		const totalSettledTo = settlementsTo.reduce(
			(sum, s) => sum + Number(s.amount),
			0,
		);

		const balance = userPaid - userOwes + totalSettledFrom - totalSettledTo;

		return {
			totalGroups,
			totalExpenses,
			totalSpent: Math.round(userPaid * 100) / 100,
			balance: Math.round(balance * 100) / 100,
			pendingSettlements,
			recentExpenses,
		};
	}),

	getCategoryBreakdown: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const userGroups = await ctx.db.group.findMany({
			where: {
				members: {
					some: { userId },
				},
			},
			select: {
				id: true,
			},
		});

		const groupIds = userGroups.map((g) => g.id);

		const expenses = await ctx.db.expense.findMany({
			where: {
				groupId: { in: groupIds },
			},
			select: {
				category: true,
				amount: true,
			},
		});

		const breakdown: Record<string, number> = {};
		for (const expense of expenses) {
			breakdown[expense.category] =
				(breakdown[expense.category] || 0) + Number(expense.amount);
		}

		return Object.entries(breakdown).map(([category, amount]) => ({
			category,
			amount: Math.round(amount * 100) / 100,
		}));
	}),

	getMonthlySpending: protectedProcedure
		.input(
			z
				.object({
					months: z.number().min(1).max(24).default(6),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const months = input?.months ?? 6;

			const userGroups = await ctx.db.group.findMany({
				where: {
					members: {
						some: { userId },
					},
				},
				select: {
					id: true,
				},
			});

			const groupIds = userGroups.map((g) => g.id);

			const startDate = new Date();
			startDate.setMonth(startDate.getMonth() - months);
			startDate.setDate(1);
			startDate.setHours(0, 0, 0, 0);

			const expenses = await ctx.db.expense.findMany({
				where: {
					groupId: { in: groupIds },
					date: {
						gte: startDate,
					},
				},
				select: {
					date: true,
					amount: true,
				},
			});

			const monthlyData: Record<string, number> = {};

			for (const expense of expenses) {
				const monthKey = `${expense.date.getFullYear()}-${String(
					expense.date.getMonth() + 1,
				).padStart(2, "0")}`;
				monthlyData[monthKey] =
					(monthlyData[monthKey] || 0) + Number(expense.amount);
			}

			return Object.entries(monthlyData)
				.map(([month, amount]) => ({
					month,
					amount: Math.round(amount * 100) / 100,
				}))
				.sort((a, b) => a.month.localeCompare(b.month));
		}),
});
