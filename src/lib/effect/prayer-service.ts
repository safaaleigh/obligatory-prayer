/**
 * Prayer Service - High-level operations that compose repository + business logic.
 * This is what Convex functions and tRPC procedures should use.
 */

import { Context, Effect, Layer } from "effect";
import { DatabaseError, InvalidPrayerTypeError } from "./errors";
import {
	type AchievementType,
	calculateStats,
	calculateStreak,
	checkAchievements,
	retrySchedule,
	validatePrayerType,
} from "./prayer-logic";
import { PrayerRepo, type PrayerRepository } from "./prayer-repository";
import type { DashboardData, PrayerCompletion, PrayerStats, PrayerType } from "./types";

// ============================================================================
// Service Interface
// ============================================================================

export interface IPrayerService {
	readonly saveCompletion: (
		userId: string,
		prayerType: string,
	) => Effect.Effect<
		{ completion: PrayerCompletion; achievements: AchievementType[] },
		DatabaseError | InvalidPrayerTypeError
	>;

	readonly getHistory: (
		userId: string,
		options?: { limit?: number; prayerType?: string },
	) => Effect.Effect<PrayerCompletion[], DatabaseError | InvalidPrayerTypeError>;

	readonly getStats: (
		userId: string,
	) => Effect.Effect<PrayerStats, DatabaseError>;

	readonly getDashboardData: (
		userId: string,
		historyLimit?: number,
	) => Effect.Effect<DashboardData, DatabaseError>;
}

// ============================================================================
// Service Tag
// ============================================================================

export class PrayerService extends Context.Tag("PrayerService")<
	PrayerService,
	IPrayerService
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const makePrayerService = Layer.effect(
	PrayerService,
	Effect.gen(function* () {
		const repo = yield* PrayerRepo;

		return {
			saveCompletion: (userId, prayerType) =>
				Effect.gen(function* () {
					// Validate prayer type
					const validType = yield* validatePrayerType(prayerType);

					// Get current stats for achievement calculation
					const existingCompletions = yield* repo
						.getCompletions(userId)
						.pipe(Effect.retry(retrySchedule));

					const previousStats = yield* calculateStats(existingCompletions);

					// Save the new completion
					const completion = yield* repo
						.saveCompletion(userId, validType as PrayerType)
						.pipe(Effect.retry(retrySchedule));

					// Calculate new stats
					const newCompletions = [completion, ...existingCompletions];
					const newStats = yield* calculateStats(newCompletions);

					// Check for new achievements
					const achievements = yield* checkAchievements(
						previousStats.total,
						previousStats.currentStreak,
						newStats.total,
						newStats.currentStreak,
						newStats.countByType,
					);

					// Save achievements
					for (const achievement of achievements) {
						yield* repo
							.saveAchievement(userId, achievement)
							.pipe(Effect.retry(retrySchedule));
					}

					yield* Effect.log(
						`Prayer saved: ${validType} for user ${userId}. Achievements: ${achievements.join(", ") || "none"}`,
					);

					return { completion, achievements };
				}),

			getHistory: (userId, options) =>
				Effect.gen(function* () {
					let prayerType: PrayerType | undefined;

					if (options?.prayerType) {
						prayerType = (yield* validatePrayerType(
							options.prayerType,
						)) as PrayerType;
					}

					const completions = yield* repo
						.getCompletions(userId, {
							limit: options?.limit,
							prayerType,
						})
						.pipe(Effect.retry(retrySchedule));

					yield* Effect.log(
						`Fetched ${completions.length} completions for user ${userId}`,
					);

					return completions;
				}),

			getStats: (userId) =>
				Effect.gen(function* () {
					const completions = yield* repo
						.getCompletions(userId)
						.pipe(Effect.retry(retrySchedule));

					const stats = yield* calculateStats(completions);

					yield* Effect.log(
						`Stats for user ${userId}: ${stats.total} total, ${stats.currentStreak} streak`,
					);

					return stats;
				}),

			getDashboardData: (userId, historyLimit = 20) =>
				Effect.gen(function* () {
					// Fetch completions once and derive everything from that
					const allCompletions = yield* repo
						.getCompletions(userId)
						.pipe(Effect.retry(retrySchedule));

					const stats = yield* calculateStats(allCompletions);
					const history = allCompletions.slice(0, historyLimit);

					yield* Effect.log(
						`Dashboard loaded for user ${userId}: ${stats.total} prayers, ${history.length} history items`,
					);

					return { stats, history };
				}),
		};
	}),
);

// ============================================================================
// Helper to create a fully-wired service layer
// ============================================================================

export const makePrayerServiceLive = (repoLayer: Layer.Layer<PrayerRepository>) =>
	Layer.provide(makePrayerService, Layer.succeed(PrayerRepo, repoLayer as unknown as PrayerRepository));
