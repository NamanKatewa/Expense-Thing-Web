import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { activityRouter } from "./routers/activity";
import { dashboardRouter } from "./routers/dashboard";
import { expenseRouter } from "./routers/expense";
import { groupRouter } from "./routers/group";
import { settlementRouter } from "./routers/settlement";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
	user: userRouter,
	group: groupRouter,
	expense: expenseRouter,
	settlement: settlementRouter,
	activity: activityRouter,
	dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
