/**
 * Tests for the PrayerRepository implementations.
 * These test the in-memory repositories directly.
 */

import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import {
	makeInMemoryPrayerRepo,
	makeSeededPrayerRepo,
	PrayerRepo,
	type PrayerType,
} from "../src/lib/effect";

// ============================================================================
// Helper to run repository operations
// ============================================================================

const runRepoTest = <A, E>(
	effect: Effect.Effect<A, E, typeof PrayerRepo.Service>,
	repoLayer = makeInMemoryPrayerRepo(),
) => Effect.runPromise(effect.pipe(Effect.provide(repoLayer)));

// ============================================================================
// In-Memory Repository Tests
// ============================================================================

describe("InMemoryPrayerRepo", () => {
	test("saveCompletion creates a completion with unique ID", async () => {
		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				const c1 = yield* repo.saveCompletion("user-1", "short");
				const c2 = yield* repo.saveCompletion("user-1", "medium");
				return [c1, c2];
			}),
		);

		expect(result[0]!.id).not.toBe(result[1]!.id);
		expect(result[0]!.prayerType).toBe("short");
		expect(result[1]!.prayerType).toBe("medium");
	});

	test("getCompletions filters by prayerType", async () => {
		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				yield* repo.saveCompletion("user-1", "short");
				yield* repo.saveCompletion("user-1", "medium");
				yield* repo.saveCompletion("user-1", "short");
				return yield* repo.getCompletions("user-1", { prayerType: "short" });
			}),
		);

		expect(result).toHaveLength(2);
		expect(result.every((c) => c.prayerType === "short")).toBe(true);
	});

	test("getCompletions respects limit", async () => {
		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				for (let i = 0; i < 10; i++) {
					yield* repo.saveCompletion("user-1", "short");
				}
				return yield* repo.getCompletions("user-1", { limit: 3 });
			}),
		);

		expect(result).toHaveLength(3);
	});

	test("saveAchievement and getAchievements work together", async () => {
		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				yield* repo.saveAchievement("user-1", "first_prayer");
				yield* repo.saveAchievement("user-1", "week_streak");
				yield* repo.saveAchievement("user-2", "first_prayer");
				return yield* repo.getAchievements("user-1");
			}),
		);

		expect(result).toHaveLength(2);
		expect(result.map((a) => a.type)).toContain("first_prayer");
		expect(result.map((a) => a.type)).toContain("week_streak");
	});
});

// ============================================================================
// Seeded Repository Tests
// ============================================================================

describe("SeededPrayerRepo", () => {
	test("can be seeded with completions", async () => {
		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
				{ userId: "user-1", prayerType: "medium", completedAt: new Date() },
			],
		});

		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				return yield* repo.getCompletions("user-1");
			}),
			seededRepo,
		);

		expect(result).toHaveLength(2);
	});

	test("can be seeded with achievements", async () => {
		const seededRepo = makeSeededPrayerRepo({
			achievements: [
				{ userId: "user-1", type: "first_prayer", unlockedAt: new Date() },
				{ userId: "user-1", type: "week_streak", unlockedAt: new Date() },
			],
		});

		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				return yield* repo.getAchievements("user-1");
			}),
			seededRepo,
		);

		expect(result).toHaveLength(2);
		expect(result.map((a) => a.type)).toContain("first_prayer");
		expect(result.map((a) => a.type)).toContain("week_streak");
	});

	test("seeded items have unique IDs", async () => {
		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
			],
			achievements: [
				{ userId: "user-1", type: "first_prayer", unlockedAt: new Date() },
			],
		});

		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				const completions = yield* repo.getCompletions("user-1");
				const achievements = yield* repo.getAchievements("user-1");
				return { completions, achievements };
			}),
			seededRepo,
		);

		expect(result.completions[0]!.id).not.toBe(result.achievements[0]!.id);
	});

	test("can add new items after seeding", async () => {
		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
			],
		});

		const result = await runRepoTest(
			Effect.gen(function* () {
				const repo = yield* PrayerRepo;
				yield* repo.saveCompletion("user-1", "medium");
				return yield* repo.getCompletions("user-1");
			}),
			seededRepo,
		);

		expect(result).toHaveLength(2);
	});
});
