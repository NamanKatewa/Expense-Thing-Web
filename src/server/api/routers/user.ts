import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
	me: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				createdAt: true,
			},
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.user.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					createdAt: true,
				},
			});
		}),

	getByEmail: protectedProcedure
		.input(z.object({ email: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.user.findUnique({
				where: { email: input.email },
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			});
		}),

	update: protectedProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.user.update({
				where: { id: ctx.session.user.id },
				data: { name: input.name },
			});
		}),
});
