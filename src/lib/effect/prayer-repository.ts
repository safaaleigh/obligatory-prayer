/**
 * Prayer Repository - Abstract interface for database operations.
 * This allows swapping between Prisma, Convex, or mock implementations.
 */

import { Context, Effect, Layer } from "effect";
import { DatabaseError } from "./errors";
import type { Achievement, PrayerCompletion, PrayerType } from "./types";

// ============================================================================
// Repository Interface
// ============================================================================

export interface PrayerRepository {
	readonly saveCompletion: (
		userId: string,
		prayerType: PrayerType,
	) => Effect.Effect<PrayerCompletion, DatabaseError>;

	readonly getCompletions: (
		userId: string,
		options?: {
			limit?: number;
			prayerType?: PrayerType;
		},
	) => Effect.Effect<PrayerCompletion[], DatabaseError>;

	readonly saveAchievement: (
		userId: string,
		achievementType: string,
	) => Effect.Effect<Achievement, DatabaseError>;

	readonly getAchievements: (
		userId: string,
	) => Effect.Effect<Achievement[], DatabaseError>;
}

// ============================================================================
// Service Tag
// ============================================================================

export class PrayerRepo extends Context.Tag("PrayerRepo")<
	PrayerRepo,
	PrayerRepository
>() {}

// ============================================================================
// In-Memory Implementation (for testing)
// ============================================================================

export const makeInMemoryPrayerRepo = () => {
	const completions: PrayerCompletion[] = [];
	const achievements: Achievement[] = [];
	let nextId = 1;

	return Layer.succeed(PrayerRepo, {
		saveCompletion: (userId, prayerType) =>
			Effect.sync(() => {
				const completion: PrayerCompletion = {
					id: String(nextId++),
					userId,
					prayerType,
					completedAt: new Date(),
				};
				completions.push(completion);
				return completion;
			}),

		getCompletions: (userId, options) =>
			Effect.sync(() => {
				let result = completions
					.filter((c) => c.userId === userId)
					.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

				if (options?.prayerType) {
					result = result.filter((c) => c.prayerType === options.prayerType);
				}

				if (options?.limit) {
					result = result.slice(0, options.limit);
				}

				return result;
			}),

		saveAchievement: (userId, achievementType) =>
			Effect.sync(() => {
				const achievement: Achievement = {
					id: String(nextId++),
					userId,
					type: achievementType,
					unlockedAt: new Date(),
				};
				achievements.push(achievement);
				return achievement;
			}),

		getAchievements: (userId) =>
			Effect.sync(() => achievements.filter((a) => a.userId === userId)),
	});
};

// ============================================================================
// Test Helper - Create repository with pre-seeded data
// ============================================================================

export const makeSeededPrayerRepo = (seed: {
	completions?: Array<Omit<PrayerCompletion, "id">>;
	achievements?: Array<Omit<Achievement, "id">>;
}) => {
	let nextId = 1;

	const completions: PrayerCompletion[] = (seed.completions ?? []).map((c) => ({
		...c,
		id: String(nextId++),
	}));

	const achievements: Achievement[] = (seed.achievements ?? []).map((a) => ({
		...a,
		id: String(nextId++),
	}));

	return Layer.succeed(PrayerRepo, {
		saveCompletion: (userId, prayerType) =>
			Effect.sync(() => {
				const completion: PrayerCompletion = {
					id: String(nextId++),
					userId,
					prayerType,
					completedAt: new Date(),
				};
				completions.push(completion);
				return completion;
			}),

		getCompletions: (userId, options) =>
			Effect.sync(() => {
				let result = completions
					.filter((c) => c.userId === userId)
					.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

				if (options?.prayerType) {
					result = result.filter((c) => c.prayerType === options.prayerType);
				}

				if (options?.limit) {
					result = result.slice(0, options.limit);
				}

				return result;
			}),

		saveAchievement: (userId, achievementType) =>
			Effect.sync(() => {
				const achievement: Achievement = {
					id: String(nextId++),
					userId,
					type: achievementType,
					unlockedAt: new Date(),
				};
				achievements.push(achievement);
				return achievement;
			}),

		getAchievements: (userId) =>
			Effect.sync(() => achievements.filter((a) => a.userId === userId)),
	});
};
