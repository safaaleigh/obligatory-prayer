/**
 * Pure business logic for prayer operations.
 * These functions are database-agnostic and can be tested in isolation.
 */

import { Effect, Schedule } from "effect";
import { InvalidPrayerTypeError, ValidationError } from "./errors";
import {
	type PrayerCompletion,
	type PrayerStats,
	type PrayerType,
	isValidPrayerType,
} from "./types";

// ============================================================================
// Retry Schedule - exponential backoff with 3 retries
// ============================================================================

export const retrySchedule = Schedule.exponential("100 millis").pipe(
	Schedule.compose(Schedule.recurs(3)),
);

// ============================================================================
// Validation Logic
// ============================================================================

export const validatePrayerType = (type: string) =>
	isValidPrayerType(type)
		? Effect.succeed(type)
		: Effect.fail(new InvalidPrayerTypeError(type));

export const validateUserId = (userId: string | null | undefined) =>
	userId
		? Effect.succeed(userId)
		: Effect.fail(new ValidationError("User ID is required"));

// ============================================================================
// Streak Calculation (pure function wrapped in Effect)
// ============================================================================

export const calculateStreak = (
	completions: Array<{ completedAt: Date }>,
	referenceDate: Date = new Date(),
) =>
	Effect.sync(() => {
		const today = new Date(referenceDate);
		today.setHours(0, 0, 0, 0);

		const completionsByDate = new Set<string>();
		for (const completion of completions) {
			const dateKey = completion.completedAt.toISOString().split("T")[0];
			if (dateKey) {
				completionsByDate.add(dateKey);
			}
		}

		let currentStreak = 0;
		const checkDate = new Date(today);

		while (true) {
			const dateKey = checkDate.toISOString().split("T")[0];
			if (dateKey && completionsByDate.has(dateKey)) {
				currentStreak++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}

		return currentStreak;
	});

// ============================================================================
// Stats Calculation (pure function wrapped in Effect)
// ============================================================================

export const calculateStats = (
	completions: PrayerCompletion[],
	referenceDate?: Date,
): Effect.Effect<PrayerStats, never> =>
	Effect.gen(function* () {
		const countByType: Record<PrayerType, number> = {
			short: completions.filter((c) => c.prayerType === "short").length,
			medium: completions.filter((c) => c.prayerType === "medium").length,
			long: completions.filter((c) => c.prayerType === "long").length,
		};

		const currentStreak = yield* calculateStreak(completions, referenceDate);

		return {
			total: completions.length,
			countByType,
			currentStreak,
			recentCompletions: completions.slice(0, 10),
		};
	});

// ============================================================================
// Achievement Logic (pure functions)
// ============================================================================

export type AchievementType =
	| "first_prayer"
	| "dedicated_10"
	| "dedicated_50"
	| "centurion"
	| "week_streak"
	| "month_streak"
	| "all_types";

export const checkAchievements = (
	previousTotal: number,
	previousStreak: number,
	newTotal: number,
	newStreak: number,
	prayerTypeCounts: Record<PrayerType, number>,
): Effect.Effect<AchievementType[], never> =>
	Effect.sync(() => {
		const achievements: AchievementType[] = [];

		// Total-based achievements
		if (previousTotal < 1 && newTotal >= 1) achievements.push("first_prayer");
		if (previousTotal < 10 && newTotal >= 10) achievements.push("dedicated_10");
		if (previousTotal < 50 && newTotal >= 50) achievements.push("dedicated_50");
		if (previousTotal < 100 && newTotal >= 100) achievements.push("centurion");

		// Streak-based achievements
		if (previousStreak < 7 && newStreak >= 7) achievements.push("week_streak");
		if (previousStreak < 30 && newStreak >= 30) achievements.push("month_streak");

		// Type-based achievements
		const allTypesCompleted =
			prayerTypeCounts.short > 0 &&
			prayerTypeCounts.medium > 0 &&
			prayerTypeCounts.long > 0;
		if (allTypesCompleted && previousTotal < 3) {
			achievements.push("all_types");
		}

		return achievements;
	});

// ============================================================================
// Input Validation Pipelines
// ============================================================================

export const validateSaveCompletionInput = (input: {
	userId: string | null | undefined;
	prayerType: string;
}) =>
	Effect.gen(function* () {
		const userId = yield* validateUserId(input.userId);
		const prayerType = yield* validatePrayerType(input.prayerType);
		return { userId, prayerType };
	});

export const validateGetHistoryInput = (input: {
	userId: string | null | undefined;
	limit?: number;
	prayerType?: string;
}) =>
	Effect.gen(function* () {
		const userId = yield* validateUserId(input.userId);

		if (input.prayerType) {
			const prayerType = yield* validatePrayerType(input.prayerType);
			return { userId, limit: input.limit, prayerType };
		}

		return { userId, limit: input.limit, prayerType: undefined };
	});
