import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const groupRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.group.findMany({
			where: {
				members: {
					some: {
						userId: ctx.session.user.id,
					},
				},
			},
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								image: true,
							},
						},
					},
				},
				_count: {
					select: {
						members: true,
						expenses: true,
					},
				},
			},
			orderBy: { updatedAt: "desc" },
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.group.findUnique({
				where: { id: input.id },
				include: {
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
								},
							},
						},
					},
					expenses: {
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
					},
					settlements: {
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
					},
				},
			});
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const group = await ctx.db.group.create({
				data: {
					name: input.name,
					description: input.description,
					members: {
						create: {
							userId: ctx.session.user.id,
							role: "OWNER",
						},
					},
				},
				include: {
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
								},
							},
						},
					},
				},
			});

			await ctx.db.activity.create({
				data: {
					type: "GROUP_CREATED",
					userId: ctx.session.user.id,
					groupId: group.id,
				},
			});

			return group;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.db.group.update({
				where: { id },
				data,
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.group.delete({
				where: { id: input.id },
			});
		}),

	addMember: protectedProcedure
		.input(
			z.object({
				groupId: z.string(),
				email: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.user.findUnique({
				where: { email: input.email },
			});

			if (!user) {
				throw new Error("User not found");
			}

			const existingMember = await ctx.db.groupMember.findUnique({
				where: {
					userId_groupId: {
						userId: user.id,
						groupId: input.groupId,
					},
				},
			});

			if (existingMember) {
				throw new Error("User is already a member");
			}

			const member = await ctx.db.groupMember.create({
				data: {
					userId: user.id,
					groupId: input.groupId,
					role: "MEMBER",
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
				},
			});

			await ctx.db.activity.create({
				data: {
					type: "MEMBER_JOINED",
					userId: user.id,
					groupId: input.groupId,
				},
			});

			return member;
		}),

	removeMember: protectedProcedure
		.input(
			z.object({
				groupId: z.string(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.groupMember.delete({
				where: {
					userId_groupId: {
						userId: input.userId,
						groupId: input.groupId,
					},
				},
			});
		}),

	getBalances: protectedProcedure
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

			return balances;
		}),
});
