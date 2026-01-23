/**
 * Integration tests for PrayerService using in-memory repository.
 * These tests demonstrate Effect's Layer system for dependency injection.
 */

import { describe, expect, test } from "bun:test";
import { Effect, Layer, Logger } from "effect";
import {
	makeInMemoryPrayerRepo,
	makeSeededPrayerRepo,
	makePrayerService,
	PrayerRepo,
	PrayerService,
	type PrayerType,
} from "../src/lib/effect";

// ============================================================================
// Test Setup
// ============================================================================

// Suppress logs during tests
const TestLogger = Logger.replace(Logger.defaultLogger, Logger.none);

// Helper to run tests with the service
const runTest = <A, E>(
	effect: Effect.Effect<A, E, PrayerService>,
	repoLayer = makeInMemoryPrayerRepo(),
) => {
	const fullLayer = Layer.provide(makePrayerService, repoLayer);
	return Effect.runPromise(
		effect.pipe(Effect.provide(fullLayer), Effect.provide(TestLogger)),
	);
};

// ============================================================================
// saveCompletion Tests
// ============================================================================

describe("PrayerService.saveCompletion", () => {
	test("saves a valid completion", async () => {
		const result = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.saveCompletion("user-1", "short");
			}),
		);

		expect(result.completion.prayerType).toBe("short");
		expect(result.completion.userId).toBe("user-1");
		expect(result.completion.id).toBeDefined();
	});

	test("rejects invalid prayer type", async () => {
		const result = await Effect.runPromiseExit(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.saveCompletion("user-1", "invalid");
			}).pipe(
				Effect.provide(Layer.provide(makePrayerService, makeInMemoryPrayerRepo())),
			),
		);

		expect(result._tag).toBe("Failure");
	});

	test("awards first_prayer achievement on first completion", async () => {
		const result = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.saveCompletion("user-1", "short");
			}),
		);

		expect(result.achievements).toContain("first_prayer");
	});

	test("does not award first_prayer on subsequent completions", async () => {
		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{
					userId: "user-1",
					prayerType: "short" as PrayerType,
					completedAt: new Date(),
				},
			],
		});

		const result = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.saveCompletion("user-1", "medium");
			}),
			seededRepo,
		);

		expect(result.achievements).not.toContain("first_prayer");
	});

	test("awards dedicated_10 on 10th completion", async () => {
		const completions = Array.from({ length: 9 }, () => ({
			userId: "user-1",
			prayerType: "short" as PrayerType,
			completedAt: new Date(),
		}));

		const seededRepo = makeSeededPrayerRepo({ completions });

		const result = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.saveCompletion("user-1", "short");
			}),
			seededRepo,
		);

		expect(result.achievements).toContain("dedicated_10");
	});
});

// ============================================================================
// getHistory Tests
// ============================================================================

describe("PrayerService.getHistory", () => {
	test("returns empty array for new user", async () => {
		const history = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getHistory("new-user");
			}),
		);

		expect(history).toHaveLength(0);
	});

	test("returns completions in descending order", async () => {
		const now = new Date();
		const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{ userId: "user-1", prayerType: "short", completedAt: yesterday },
				{ userId: "user-1", prayerType: "medium", completedAt: now },
			],
		});

		const history = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getHistory("user-1");
			}),
			seededRepo,
		);

		expect(history).toHaveLength(2);
		expect(history[0]!.prayerType).toBe("medium"); // More recent first
	});

	test("filters by prayer type", async () => {
		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
				{ userId: "user-1", prayerType: "medium", completedAt: new Date() },
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
			],
		});

		const history = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getHistory("user-1", { prayerType: "short" });
			}),
			seededRepo,
		);

		expect(history).toHaveLength(2);
		expect(history.every((c) => c.prayerType === "short")).toBe(true);
	});

	test("respects limit parameter", async () => {
		const completions = Array.from({ length: 20 }, () => ({
			userId: "user-1",
			prayerType: "short" as PrayerType,
			completedAt: new Date(),
		}));

		const seededRepo = makeSeededPrayerRepo({ completions });

		const history = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getHistory("user-1", { limit: 5 });
			}),
			seededRepo,
		);

		expect(history).toHaveLength(5);
	});

	test("only returns completions for specified user", async () => {
		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
				{ userId: "user-2", prayerType: "medium", completedAt: new Date() },
				{ userId: "user-1", prayerType: "long", completedAt: new Date() },
			],
		});

		const history = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getHistory("user-1");
			}),
			seededRepo,
		);

		expect(history).toHaveLength(2);
		expect(history.every((c) => c.userId === "user-1")).toBe(true);
	});
});

// ============================================================================
// getStats Tests
// ============================================================================

describe("PrayerService.getStats", () => {
	test("returns zero stats for new user", async () => {
		const stats = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getStats("new-user");
			}),
		);

		expect(stats.total).toBe(0);
		expect(stats.currentStreak).toBe(0);
		expect(stats.countByType).toEqual({ short: 0, medium: 0, long: 0 });
	});

	test("calculates correct totals", async () => {
		const seededRepo = makeSeededPrayerRepo({
			completions: [
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
				{ userId: "user-1", prayerType: "short", completedAt: new Date() },
				{ userId: "user-1", prayerType: "medium", completedAt: new Date() },
				{ userId: "user-1", prayerType: "long", completedAt: new Date() },
			],
		});

		const stats = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getStats("user-1");
			}),
			seededRepo,
		);

		expect(stats.total).toBe(4);
		expect(stats.countByType.short).toBe(2);
		expect(stats.countByType.medium).toBe(1);
		expect(stats.countByType.long).toBe(1);
	});
});

// ============================================================================
// getDashboardData Tests
// ============================================================================

describe("PrayerService.getDashboardData", () => {
	test("returns both stats and history", async () => {
		const completions = Array.from({ length: 5 }, () => ({
			userId: "user-1",
			prayerType: "short" as PrayerType,
			completedAt: new Date(),
		}));

		const seededRepo = makeSeededPrayerRepo({ completions });

		const dashboard = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getDashboardData("user-1");
			}),
			seededRepo,
		);

		expect(dashboard.stats.total).toBe(5);
		expect(dashboard.history).toHaveLength(5);
	});

	test("respects history limit", async () => {
		const completions = Array.from({ length: 30 }, () => ({
			userId: "user-1",
			prayerType: "short" as PrayerType,
			completedAt: new Date(),
		}));

		const seededRepo = makeSeededPrayerRepo({ completions });

		const dashboard = await runTest(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.getDashboardData("user-1", 10);
			}),
			seededRepo,
		);

		expect(dashboard.stats.total).toBe(30); // Stats include all
		expect(dashboard.history).toHaveLength(10); // History is limited
	});
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describe("Error handling", () => {
	test("validation errors have correct tag", async () => {
		const result = await Effect.runPromiseExit(
			Effect.gen(function* () {
				const service = yield* PrayerService;
				return yield* service.saveCompletion("user-1", "invalid-type");
			}).pipe(
				Effect.provide(Layer.provide(makePrayerService, makeInMemoryPrayerRepo())),
			),
		);

		expect(result._tag).toBe("Failure");
	});
});
