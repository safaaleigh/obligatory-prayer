/**
 * Shared types for the prayer application.
 */

export const VALID_PRAYER_TYPES = ["short", "medium", "long"] as const;
export type PrayerType = (typeof VALID_PRAYER_TYPES)[number];

export const isValidPrayerType = (type: string): type is PrayerType =>
	VALID_PRAYER_TYPES.includes(type as PrayerType);

export interface PrayerCompletion {
	id: string;
	userId: string;
	prayerType: PrayerType;
	completedAt: Date;
}

export interface PrayerStats {
	total: number;
	countByType: Record<PrayerType, number>;
	currentStreak: number;
	recentCompletions: PrayerCompletion[];
}

export interface DashboardData {
	stats: PrayerStats;
	history: PrayerCompletion[];
}

export interface Achievement {
	id: string;
	userId: string;
	type: string;
	unlockedAt: Date;
}

export interface User {
	id: string;
	name: string;
	email: string;
}
