import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const expenseCategoryEnum = z.enum([
	"FOOD",
	"TRANSPORT",
	"HOUSING",
	"UTILITIES",
	"ENTERTAINMENT",
	"SHOPPING",
	"HEALTHCARE",
	"TRAVEL",
	"EDUCATION",
	"OTHER",
]);

const splitTypeEnum = z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]);

export const expenseRouter = createTRPCRouter({
	getAllByGroup: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.expense.findMany({
				where: { groupId: input.groupId },
				include: {
					createdBy: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					payers: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
					},
					splits: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
					},
				},
				orderBy: { date: "desc" },
			});
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.expense.findUnique({
				where: { id: input.id },
				include: {
					createdBy: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					payers: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
					},
					splits: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
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
				description: z.string().min(1),
				amount: z.number().positive(),
				date: z.date(),
				category: expenseCategoryEnum,
				payerId: z.string(),
				payerAmount: z.number().positive(),
				splits: z.array(
					z.object({
						userId: z.string(),
						type: splitTypeEnum,
						value: z.number().positive(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const expense = await ctx.db.expense.create({
				data: {
					groupId: input.groupId,
					description: input.description,
					amount: input.amount,
					date: input.date,
					category: input.category as
						| "FOOD"
						| "TRANSPORT"
						| "HOUSING"
						| "UTILITIES"
						| "ENTERTAINMENT"
						| "SHOPPING"
						| "HEALTHCARE"
						| "TRAVEL"
						| "EDUCATION"
						| "OTHER",
					createdById: ctx.session.user.id,
					payers: {
						create: {
							userId: input.payerId,
							amount: input.payerAmount,
							isPaid: true,
						},
					},
					splits: {
						create: input.splits.map((split) => ({
							userId: split.userId,
							type: split.type as "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES",
							value: split.value,
						})),
					},
				},
				include: {
					createdBy: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					payers: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
					},
					splits: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
					},
				},
			});

			await ctx.db.activity.create({
				data: {
					type: "EXPENSE_CREATED",
					userId: ctx.session.user.id,
					groupId: input.groupId,
					expenseId: expense.id,
				},
			});

			return expense;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				description: z.string().min(1).optional(),
				amount: z.number().positive().optional(),
				date: z.date().optional(),
				category: expenseCategoryEnum.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, description, amount, date, category } = input;

			const updateData: Record<string, unknown> = {};
			if (description !== undefined) updateData.description = description;
			if (amount !== undefined) updateData.amount = amount;
			if (date !== undefined) updateData.date = date;
			if (category !== undefined) updateData.category = category;

			const expense = await ctx.db.expense.update({
				where: { id },
				data: updateData,
			});

			await ctx.db.activity.create({
				data: {
					type: "EXPENSE_EDITED",
					userId: ctx.session.user.id,
					groupId: expense.groupId,
					expenseId: id,
				},
			});

			return expense;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const expense = await ctx.db.expense.findUnique({
				where: { id: input.id },
			});

			if (!expense) {
				throw new Error("Expense not found");
			}

			await ctx.db.activity.create({
				data: {
					type: "EXPENSE_DELETED",
					userId: ctx.session.user.id,
					groupId: expense.groupId,
				},
			});

			return ctx.db.expense.delete({
				where: { id: input.id },
			});
		}),
});
