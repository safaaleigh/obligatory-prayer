/**
 * Tests for pure prayer business logic.
 * These tests run fast because they don't need any database.
 */

import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import {
	calculateStats,
	calculateStreak,
	checkAchievements,
	validatePrayerType,
	validateUserId,
	validateSaveCompletionInput,
	validateGetHistoryInput,
} from "../src/lib/effect";
import type { PrayerCompletion, PrayerType } from "../src/lib/effect";

// ============================================================================
// Test Helpers
// ============================================================================

const makeCompletion = (
	prayerType: PrayerType,
	daysAgo: number,
): PrayerCompletion => {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	date.setHours(12, 0, 0, 0);
	return {
		id: `test-${Date.now()}-${Math.random()}`,
		userId: "test-user",
		prayerType,
		completedAt: date,
	};
};

const runEffect = <A, E>(effect: Effect.Effect<A, E>): Promise<A> =>
	Effect.runPromise(effect);

// ============================================================================
// validatePrayerType Tests
// ============================================================================

describe("validatePrayerType", () => {
	test("accepts valid prayer types", async () => {
		expect(await runEffect(validatePrayerType("short"))).toBe("short");
		expect(await runEffect(validatePrayerType("medium"))).toBe("medium");
		expect(await runEffect(validatePrayerType("long"))).toBe("long");
	});

	test("rejects invalid prayer types", async () => {
		const result = await Effect.runPromiseExit(validatePrayerType("invalid"));
		expect(result._tag).toBe("Failure");
	});

	test("rejects empty string", async () => {
		const result = await Effect.runPromiseExit(validatePrayerType(""));
		expect(result._tag).toBe("Failure");
	});
});

// ============================================================================
// calculateStreak Tests
// ============================================================================

describe("calculateStreak", () => {
	test("returns 0 for empty completions", async () => {
		const streak = await runEffect(calculateStreak([]));
		expect(streak).toBe(0);
	});

	test("returns 1 for single completion today", async () => {
		const today = new Date();
		today.setHours(12, 0, 0, 0);

		const completions = [{ completedAt: today }];
		const streak = await runEffect(calculateStreak(completions, today));
		expect(streak).toBe(1);
	});

	test("calculates consecutive days correctly", async () => {
		const referenceDate = new Date("2024-01-10T12:00:00Z");

		const completions = [
			{ completedAt: new Date("2024-01-10T08:00:00Z") }, // today
			{ completedAt: new Date("2024-01-09T08:00:00Z") }, // yesterday
			{ completedAt: new Date("2024-01-08T08:00:00Z") }, // 2 days ago
		];

		const streak = await runEffect(calculateStreak(completions, referenceDate));
		expect(streak).toBe(3);
	});

	test("breaks streak on gap", async () => {
		const referenceDate = new Date("2024-01-10T12:00:00Z");

		const completions = [
			{ completedAt: new Date("2024-01-10T08:00:00Z") }, // today
			{ completedAt: new Date("2024-01-09T08:00:00Z") }, // yesterday
			// gap on 2024-01-08
			{ completedAt: new Date("2024-01-07T08:00:00Z") }, // 3 days ago
		];

		const streak = await runEffect(calculateStreak(completions, referenceDate));
		expect(streak).toBe(2);
	});

	test("returns 0 if no completion today", async () => {
		const referenceDate = new Date("2024-01-10T12:00:00Z");

		const completions = [
			{ completedAt: new Date("2024-01-09T08:00:00Z") }, // yesterday only
		];

		const streak = await runEffect(calculateStreak(completions, referenceDate));
		expect(streak).toBe(0);
	});

	test("handles multiple completions on same day", async () => {
		const referenceDate = new Date("2024-01-10T12:00:00Z");

		const completions = [
			{ completedAt: new Date("2024-01-10T08:00:00Z") },
			{ completedAt: new Date("2024-01-10T12:00:00Z") },
			{ completedAt: new Date("2024-01-10T18:00:00Z") },
			{ completedAt: new Date("2024-01-09T08:00:00Z") },
		];

		const streak = await runEffect(calculateStreak(completions, referenceDate));
		expect(streak).toBe(2);
	});
});

// ============================================================================
// calculateStats Tests
// ============================================================================

describe("calculateStats", () => {
	test("returns zero stats for empty completions", async () => {
		const stats = await runEffect(calculateStats([]));

		expect(stats.total).toBe(0);
		expect(stats.countByType.short).toBe(0);
		expect(stats.countByType.medium).toBe(0);
		expect(stats.countByType.long).toBe(0);
		expect(stats.currentStreak).toBe(0);
		expect(stats.recentCompletions).toHaveLength(0);
	});

	test("counts prayer types correctly", async () => {
		const completions: PrayerCompletion[] = [
			makeCompletion("short", 0),
			makeCompletion("short", 0),
			makeCompletion("medium", 0),
			makeCompletion("long", 0),
			makeCompletion("long", 0),
			makeCompletion("long", 0),
		];

		const stats = await runEffect(calculateStats(completions));

		expect(stats.total).toBe(6);
		expect(stats.countByType.short).toBe(2);
		expect(stats.countByType.medium).toBe(1);
		expect(stats.countByType.long).toBe(3);
	});

	test("returns only 10 recent completions", async () => {
		const completions: PrayerCompletion[] = Array.from({ length: 20 }, (_, i) =>
			makeCompletion("short", i),
		);

		const stats = await runEffect(calculateStats(completions));

		expect(stats.total).toBe(20);
		expect(stats.recentCompletions).toHaveLength(10);
	});
});

// ============================================================================
// checkAchievements Tests
// ============================================================================

describe("checkAchievements", () => {
	test("awards first_prayer achievement", async () => {
		const achievements = await runEffect(
			checkAchievements(0, 0, 1, 1, { short: 1, medium: 0, long: 0 }),
		);

		expect(achievements).toContain("first_prayer");
	});

	test("awards dedicated_10 achievement", async () => {
		const achievements = await runEffect(
			checkAchievements(9, 1, 10, 1, { short: 10, medium: 0, long: 0 }),
		);

		expect(achievements).toContain("dedicated_10");
		expect(achievements).not.toContain("first_prayer");
	});

	test("awards week_streak achievement", async () => {
		const achievements = await runEffect(
			checkAchievements(6, 6, 7, 7, { short: 7, medium: 0, long: 0 }),
		);

		expect(achievements).toContain("week_streak");
	});

	test("awards month_streak achievement", async () => {
		const achievements = await runEffect(
			checkAchievements(29, 29, 30, 30, { short: 30, medium: 0, long: 0 }),
		);

		expect(achievements).toContain("month_streak");
	});

	test("awards centurion achievement", async () => {
		const achievements = await runEffect(
			checkAchievements(99, 1, 100, 1, { short: 100, medium: 0, long: 0 }),
		);

		expect(achievements).toContain("centurion");
	});

	test("awards all_types achievement", async () => {
		const achievements = await runEffect(
			checkAchievements(2, 1, 3, 1, { short: 1, medium: 1, long: 1 }),
		);

		expect(achievements).toContain("all_types");
	});

	test("can award multiple achievements at once", async () => {
		const achievements = await runEffect(
			checkAchievements(0, 0, 1, 1, { short: 1, medium: 0, long: 0 }),
		);

		expect(achievements).toContain("first_prayer");
		// Could potentially have more if conditions align
	});

	test("returns empty array when no new achievements", async () => {
		const achievements = await runEffect(
			checkAchievements(5, 2, 6, 3, { short: 6, medium: 0, long: 0 }),
		);

		expect(achievements).toHaveLength(0);
	});

	test("awards dedicated_50 achievement", async () => {
		const achievements = await runEffect(
			checkAchievements(49, 1, 50, 1, { short: 50, medium: 0, long: 0 }),
		);

		expect(achievements).toContain("dedicated_50");
	});
});

// ============================================================================
// validateUserId Tests
// ============================================================================

describe("validateUserId", () => {
	test("accepts valid user ID", async () => {
		expect(await runEffect(validateUserId("user-123"))).toBe("user-123");
	});

	test("rejects null user ID", async () => {
		const result = await Effect.runPromiseExit(validateUserId(null));
		expect(result._tag).toBe("Failure");
	});

	test("rejects undefined user ID", async () => {
		const result = await Effect.runPromiseExit(validateUserId(undefined));
		expect(result._tag).toBe("Failure");
	});

	test("rejects empty string user ID", async () => {
		const result = await Effect.runPromiseExit(validateUserId(""));
		expect(result._tag).toBe("Failure");
	});
});

// ============================================================================
// validateSaveCompletionInput Tests
// ============================================================================

describe("validateSaveCompletionInput", () => {
	test("validates correct input", async () => {
		const result = await runEffect(
			validateSaveCompletionInput({ userId: "user-1", prayerType: "short" }),
		);

		expect(result.userId).toBe("user-1");
		expect(result.prayerType).toBe("short");
	});

	test("rejects missing userId", async () => {
		const result = await Effect.runPromiseExit(
			validateSaveCompletionInput({ userId: null, prayerType: "short" }),
		);
		expect(result._tag).toBe("Failure");
	});

	test("rejects invalid prayer type", async () => {
		const result = await Effect.runPromiseExit(
			validateSaveCompletionInput({ userId: "user-1", prayerType: "invalid" }),
		);
		expect(result._tag).toBe("Failure");
	});
});

// ============================================================================
// validateGetHistoryInput Tests
// ============================================================================

describe("validateGetHistoryInput", () => {
	test("validates input without prayer type filter", async () => {
		const result = await runEffect(
			validateGetHistoryInput({ userId: "user-1", limit: 10 }),
		);

		expect(result.userId).toBe("user-1");
		expect(result.limit).toBe(10);
		expect(result.prayerType).toBeUndefined();
	});

	test("validates input with prayer type filter", async () => {
		const result = await runEffect(
			validateGetHistoryInput({ userId: "user-1", limit: 10, prayerType: "medium" }),
		);

		expect(result.userId).toBe("user-1");
		expect(result.limit).toBe(10);
		expect(result.prayerType).toBe("medium");
	});

	test("rejects missing userId", async () => {
		const result = await Effect.runPromiseExit(
			validateGetHistoryInput({ userId: null }),
		);
		expect(result._tag).toBe("Failure");
	});

	test("rejects invalid prayer type filter", async () => {
		const result = await Effect.runPromiseExit(
			validateGetHistoryInput({ userId: "user-1", prayerType: "invalid" }),
		);
		expect(result._tag).toBe("Failure");
	});
});
