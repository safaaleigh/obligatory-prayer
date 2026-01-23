/**
 * Convex functions for prayer operations.
 * These use Effect for business logic while Convex handles the reactive database.
 */

import { Effect, Layer } from "effect";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
	calculateStats,
	checkAchievements,
	DatabaseError,
	type PrayerCompletion,
	PrayerRepo,
	type PrayerType,
	validatePrayerType,
} from "../src/lib/effect";

// ============================================================================
// Helper: Convert Convex doc to our PrayerCompletion type
// ============================================================================

const toCompletion = (doc: Doc<"prayerCompletions">): PrayerCompletion => ({
	id: doc._id,
	userId: doc.userId,
	prayerType: doc.prayerType as PrayerType,
	completedAt: new Date(doc.completedAt),
});

// ============================================================================
// Convex Repository Adapter
// ============================================================================

// Note: This creates a repository that wraps Convex's ctx.db
// We pass ctx to each function since Convex doesn't support long-lived connections

// ============================================================================
// Mutations
// ============================================================================

export const saveCompletion = mutation({
	args: {
		prayerType: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const userId = identity.subject;

		// Use Effect for validation and business logic
		const program = Effect.gen(function* () {
			// Validate prayer type
			const validType = yield* validatePrayerType(args.prayerType);

			// Get existing completions for achievement calculation
			const existingDocs = await ctx.db
				.query("prayerCompletions")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.order("desc")
				.collect();

			const existingCompletions = existingDocs.map(toCompletion);
			const previousStats = yield* calculateStats(existingCompletions);

			// Save to Convex (this is reactive!)
			const completionId = await ctx.db.insert("prayerCompletions", {
				userId,
				prayerType: validType as "short" | "medium" | "long",
				completedAt: Date.now(),
			});

			// Get the saved document
			const savedDoc = await ctx.db.get(completionId);
			if (!savedDoc) {
				return yield* Effect.fail(new DatabaseError("Failed to save completion"));
			}

			const newCompletion = toCompletion(savedDoc);
			const newCompletions = [newCompletion, ...existingCompletions];
			const newStats = yield* calculateStats(newCompletions);

			// Check for achievements
			const achievements = yield* checkAchievements(
				previousStats.total,
				previousStats.currentStreak,
				newStats.total,
				newStats.currentStreak,
				newStats.countByType,
			);

			// Save achievements to Convex
			for (const achievement of achievements) {
				await ctx.db.insert("achievements", {
					userId,
					type: achievement,
					unlockedAt: Date.now(),
				});
			}

			yield* Effect.log(
				`Prayer saved: ${validType}. Achievements: ${achievements.join(", ") || "none"}`,
			);

			return {
				completionId,
				prayerType: validType,
				achievements,
			};
		});

		return Effect.runPromise(program);
	},
});

// ============================================================================
// Queries (Reactive!)
// ============================================================================

export const getHistory = query({
	args: {
		limit: v.optional(v.number()),
		prayerType: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		const userId = identity.subject;

		// Use Effect for validation
		const program = Effect.gen(function* () {
			let prayerType: PrayerType | undefined;
			if (args.prayerType) {
				prayerType = (yield* validatePrayerType(args.prayerType)) as PrayerType;
			}

			// Query Convex (reactive - clients auto-update!)
			let query = ctx.db
				.query("prayerCompletions")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.order("desc");

			const docs = await query.take(args.limit ?? 50);

			let completions = docs.map(toCompletion);

			if (prayerType) {
				completions = completions.filter((c) => c.prayerType === prayerType);
			}

			return completions;
		});

		return Effect.runPromise(
			program.pipe(Effect.orElse(() => Effect.succeed([] as PrayerCompletion[]))),
		);
	},
});

export const getStats = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const userId = identity.subject;

		// Query completions (reactive!)
		const docs = await ctx.db
			.query("prayerCompletions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();

		const completions = docs.map(toCompletion);

		// Use Effect for stats calculation
		return Effect.runPromise(calculateStats(completions));
	},
});

export const getDashboardData = query({
	args: {
		historyLimit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const userId = identity.subject;
		const historyLimit = args.historyLimit ?? 20;

		// Single query, derive everything (reactive!)
		const docs = await ctx.db
			.query("prayerCompletions")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();

		const completions = docs.map(toCompletion);

		// Use Effect for stats calculation
		const stats = await Effect.runPromise(calculateStats(completions));
		const history = completions.slice(0, historyLimit);

		return { stats, history };
	},
});

export const getAchievements = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		const userId = identity.subject;

		const docs = await ctx.db
			.query("achievements")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		return docs.map((doc) => ({
			id: doc._id,
			type: doc.type,
			unlockedAt: new Date(doc.unlockedAt),
		}));
	},
});
