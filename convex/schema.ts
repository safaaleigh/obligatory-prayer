import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	prayerCompletions: defineTable({
		userId: v.string(),
		prayerType: v.union(
			v.literal("short"),
			v.literal("medium"),
			v.literal("long"),
		),
		completedAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_user_and_date", ["userId", "completedAt"])
		.index("by_user_and_type", ["userId", "prayerType"]),

	achievements: defineTable({
		userId: v.string(),
		type: v.string(),
		unlockedAt: v.number(),
	}).index("by_user", ["userId"]),

	users: defineTable({
		name: v.string(),
		email: v.string(),
		// Convex Auth will add more fields
	}).index("by_email", ["email"]),
});
