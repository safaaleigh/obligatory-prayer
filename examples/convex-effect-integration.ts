/**
 * Example: Combining Convex + Effect
 *
 * This shows how you could use Convex as your reactive backend platform
 * while leveraging Effect for robust business logic inside Convex functions.
 *
 * Benefits:
 * - Convex: Real-time reactivity, automatic sync, no infrastructure to manage
 * - Effect: Typed errors, retry logic, composable pipelines, observability
 */

import { Effect, Schedule } from "effect";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// Typed Errors (Effect)
// ============================================================================

class ValidationError {
	readonly _tag = "ValidationError";
	constructor(readonly message: string) {}
}

class StreakCalculationError {
	readonly _tag = "StreakCalculationError";
	constructor(readonly cause: unknown) {}
}

// ============================================================================
// Effect-based Business Logic
// ============================================================================

const VALID_PRAYER_TYPES = ["short", "medium", "long"] as const;
type PrayerType = (typeof VALID_PRAYER_TYPES)[number];

const validatePrayerType = (type: string) =>
	VALID_PRAYER_TYPES.includes(type as PrayerType)
		? Effect.succeed(type as PrayerType)
		: Effect.fail(new ValidationError(`Invalid prayer type: ${type}`));

const calculateStreak = (completions: Array<{ completedAt: number }>) =>
	Effect.try({
		try: () => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const completionsByDate = new Set<string>();
			for (const c of completions) {
				const dateKey = new Date(c.completedAt).toISOString().split("T")[0];
				if (dateKey) completionsByDate.add(dateKey);
			}

			let streak = 0;
			const checkDate = new Date(today);
			while (true) {
				const dateKey = checkDate.toISOString().split("T")[0];
				if (dateKey && completionsByDate.has(dateKey)) {
					streak++;
					checkDate.setDate(checkDate.getDate() - 1);
				} else {
					break;
				}
			}
			return streak;
		},
		catch: (error) => new StreakCalculationError(error),
	});

// ============================================================================
// Convex Mutations (with Effect for validation)
// ============================================================================

export const saveCompletion = mutation({
	args: {
		prayerType: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		// Use Effect for validation with typed errors
		const validatedType = await Effect.runPromise(
			validatePrayerType(args.prayerType).pipe(
				Effect.mapError((e) => new Error(e.message)),
			),
		);

		// Convex handles the database - it's automatically reactive!
		const completionId = await ctx.db.insert("prayerCompletions", {
			userId: identity.subject,
			prayerType: validatedType,
			completedAt: Date.now(),
		});

		return completionId;
	},
});

// ============================================================================
// Convex Queries (reactive + Effect for complex logic)
// ============================================================================

export const getStats = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		// Convex query - automatically re-runs when data changes!
		const completions = await ctx.db
			.query("prayerCompletions")
			.withIndex("by_user", (q) => q.eq("userId", identity.subject))
			.order("desc")
			.collect();

		// Use Effect for complex streak calculation with error handling
		const statsEffect = Effect.gen(function* () {
			const streak = yield* calculateStreak(completions);

			const countByType = {
				short: completions.filter((c) => c.prayerType === "short").length,
				medium: completions.filter((c) => c.prayerType === "medium").length,
				long: completions.filter((c) => c.prayerType === "long").length,
			};

			yield* Effect.log(`Stats calculated: ${completions.length} total, ${streak} day streak`);

			return {
				total: completions.length,
				countByType,
				currentStreak: streak,
				recentCompletions: completions.slice(0, 10),
			};
		});

		return Effect.runPromise(statsEffect);
	},
});

export const getHistory = query({
	args: {
		limit: v.optional(v.number()),
		prayerType: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return [];

		// Convex handles the query - clients automatically get updates!
		let query = ctx.db
			.query("prayerCompletions")
			.withIndex("by_user", (q) => q.eq("userId", identity.subject))
			.order("desc");

		const completions = await query.take(args.limit ?? 50);

		// Filter by prayer type if specified (using Effect for validation)
		if (args.prayerType) {
			const filterEffect = Effect.gen(function* () {
				const validType = yield* validatePrayerType(args.prayerType!);
				return completions.filter((c) => c.prayerType === validType);
			});

			return Effect.runPromise(
				filterEffect.pipe(Effect.orElse(() => Effect.succeed(completions))),
			);
		}

		return completions;
	},
});

// ============================================================================
// Example: Complex workflow with Effect inside Convex
// ============================================================================

export const completePrayerWithAchievements = mutation({
	args: {
		prayerType: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		// Complex workflow using Effect
		const workflow = Effect.gen(function* () {
			// Step 1: Validate input
			const validType = yield* validatePrayerType(args.prayerType);
			yield* Effect.log(`Validated prayer type: ${validType}`);

			// Step 2: Get current stats for achievement check
			const completions = await ctx.db
				.query("prayerCompletions")
				.withIndex("by_user", (q) => q.eq("userId", identity.subject))
				.collect();

			const currentStreak = yield* calculateStreak(completions);

			// Step 3: Determine achievements
			const newTotal = completions.length + 1;
			const achievements: string[] = [];

			if (newTotal === 1) achievements.push("first_prayer");
			if (newTotal === 10) achievements.push("dedicated_10");
			if (newTotal === 100) achievements.push("centurion");
			if (currentStreak + 1 === 7) achievements.push("week_streak");
			if (currentStreak + 1 === 30) achievements.push("month_streak");

			yield* Effect.log(`Achievements unlocked: ${achievements.join(", ") || "none"}`);

			return { validType, achievements };
		});

		const { validType, achievements } = await Effect.runPromise(workflow);

		// Save completion (Convex handles this reactively)
		const completionId = await ctx.db.insert("prayerCompletions", {
			userId: identity.subject,
			prayerType: validType,
			completedAt: Date.now(),
		});

		// Save achievements if any
		for (const achievement of achievements) {
			await ctx.db.insert("achievements", {
				userId: identity.subject,
				type: achievement,
				unlockedAt: Date.now(),
			});
		}

		return { completionId, achievements };
	},
});

// ============================================================================
// Schema (would go in convex/schema.ts)
// ============================================================================

/*
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  prayerCompletions: defineTable({
    userId: v.string(),
    prayerType: v.string(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "prayerType"]),

  achievements: defineTable({
    userId: v.string(),
    type: v.string(),
    unlockedAt: v.number(),
  }).index("by_user", ["userId"]),
});
*/

// ============================================================================
// React Usage (automatic real-time updates!)
// ============================================================================

/*
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PrayerDashboard() {
  // These automatically update when data changes - no polling!
  const stats = useQuery(api.prayers.getStats);
  const history = useQuery(api.prayers.getHistory, { limit: 10 });

  const saveCompletion = useMutation(api.prayers.saveCompletion);
  const completeWithAchievements = useMutation(api.prayers.completePrayerWithAchievements);

  const handleComplete = async (type: string) => {
    const result = await completeWithAchievements({ prayerType: type });
    if (result.achievements.length > 0) {
      toast(`🎉 Achievement unlocked: ${result.achievements.join(", ")}`);
    }
  };

  return (
    <div>
      <h1>Current Streak: {stats?.currentStreak ?? 0} days</h1>
      <button onClick={() => handleComplete("short")}>Complete Short Prayer</button>

      {/* This list updates in real-time across all clients! *}
      <ul>
        {history?.map((h) => (
          <li key={h._id}>{h.prayerType} - {new Date(h.completedAt).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
*/
