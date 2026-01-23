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
			return runPrayerEffect(ctx.db, (service) =>
				service.getHistory(ctx.session.user.id, input ?? undefined),
			).catch(() => {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch prayer history",
				});
			});
		}),

	getStats: protectedProcedure.query(async ({ ctx }) => {
		return runPrayerEffect(ctx.db, (service) =>
			service.getStats(ctx.session.user.id),
		).catch(() => {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch prayer stats",
			});
		});
	}),

	// Parallel data fetching for dashboard - fetches stats and history concurrently
	getDashboardData: protectedProcedure
		.input(
			z
				.object({
					historyLimit: z.number().min(1).max(100).optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			return runPrayerEffect(ctx.db, (service) =>
				service.getDashboardData(
					ctx.session.user.id,
					input?.historyLimit ?? 20,
				),
			).catch(() => {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch dashboard data",
				});
			});
		}),
});
