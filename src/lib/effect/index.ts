/**
 * Effect-based prayer application core.
 * This module provides database-agnostic business logic.
 */

// Errors
export {
	type AppError,
	DatabaseError,
	InvalidPrayerTypeError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "./errors";

// Types
export {
	type Achievement,
	type DashboardData,
	type PrayerCompletion,
	type PrayerStats,
	type PrayerType,
	type User,
	isValidPrayerType,
	VALID_PRAYER_TYPES,
} from "./types";

// Business Logic
export {
	type AchievementType,
	calculateStats,
	calculateStreak,
	checkAchievements,
	retrySchedule,
	validateGetHistoryInput,
	validatePrayerType,
	validateSaveCompletionInput,
	validateUserId,
} from "./prayer-logic";

// Repository
export {
	makeInMemoryPrayerRepo,
	makeSeededPrayerRepo,
	PrayerRepo,
	type PrayerRepository,
} from "./prayer-repository";

// Service
export {
	type IPrayerService,
	makePrayerService,
	makePrayerServiceLive,
	PrayerService,
} from "./prayer-service";
