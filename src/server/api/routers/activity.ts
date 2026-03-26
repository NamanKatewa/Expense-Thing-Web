import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const activityRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(50),
					cursor: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 50;
			const cursor = input?.cursor;

			const activities = await ctx.db.activity.findMany({
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				where: {
					OR: [
						{ userId: ctx.session.user.id },
						{
							group: {
								members: {
									some: {
										userId: ctx.session.user.id,
									},
								},
							},
						},
					],
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					group: {
						select: {
							id: true,
							name: true,
						},
					},
					expense: {
						select: {
							id: true,
							description: true,
							amount: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			let nextCursor: typeof cursor | undefined;
			if (activities.length > limit) {
				const nextItem = activities.pop();
				nextCursor = nextItem?.id;
			}

			return {
				activities,
				nextCursor,
			};
		}),

	getByGroup: protectedProcedure
		.input(
			z.object({
				groupId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				cursor: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { groupId, limit, cursor } = input;

			const activities = await ctx.db.activity.findMany({
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				where: {
					groupId,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					group: {
						select: {
							id: true,
							name: true,
						},
					},
					expense: {
						select: {
							id: true,
							description: true,
							amount: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			let nextCursor: typeof cursor | undefined;
			if (activities.length > limit) {
				const nextItem = activities.pop();
				nextCursor = nextItem?.id;
			}

			return {
				activities,
				nextCursor,
			};
		}),
});
