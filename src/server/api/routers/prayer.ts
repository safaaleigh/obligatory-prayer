import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";
import { runPrayerEffect, InvalidPrayerTypeError } from "@/server/services/prayer";
import { TRPCError } from "@trpc/server";

export const prayerRouter = createTRPCRouter({
	saveCompletion: protectedProcedure
		.input(
			z.object({
				prayerType: z.enum(["short", "medium", "long"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return runPrayerEffect(ctx.db, (service) =>
				service.saveCompletion(ctx.session.user.id, input.prayerType),
			).catch((error: unknown) => {
				// Transform Effect errors to tRPC errors
				if (error instanceof InvalidPrayerTypeError) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Invalid prayer type: ${error.prayerType}`,
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to save prayer completion",
				});
			});
		}),

	getHistory: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).optional(),
					prayerType: z.enum(["short", "medium", "long"]).optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const completions = await ctx.db.prayerCompletion.findMany({
				where: {
					userId: ctx.session.user.id,
					...(input?.prayerType && { prayerType: input.prayerType }),
				},
				orderBy: { completedAt: "desc" },
				take: input?.limit ?? 50,
			});

			return completions;
		}),

	getStats: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Get all completions for the user
		const completions = await ctx.db.prayerCompletion.findMany({
			where: { userId },
			orderBy: { completedAt: "desc" },
		});

		// Count by prayer type
		const countByType = {
			short: completions.filter((c) => c.prayerType === "short").length,
			medium: completions.filter((c) => c.prayerType === "medium").length,
			long: completions.filter((c) => c.prayerType === "long").length,
		};

		// Calculate current streak
		let currentStreak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Group completions by date
		const completionsByDate = new Map<string, boolean>();
		for (const completion of completions) {
			const dateKey = completion.completedAt.toISOString().split("T")[0];
			if (dateKey) {
				completionsByDate.set(dateKey, true);
			}
		}

		// Calculate streak
		let checkDate = new Date(today);
		while (true) {
			const dateKey = checkDate.toISOString().split("T")[0];
			if (dateKey && completionsByDate.has(dateKey)) {
				currentStreak++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}

		return {
			total: completions.length,
			countByType,
			currentStreak,
			recentCompletions: completions.slice(0, 10),
		};
	}),
});
