import { Effect, Context, Layer, Schedule } from "effect";
import type { PrismaClient, PrayerCompletion } from "@prisma/client";

// ============================================================================
// Typed Errors
// ============================================================================

export class DatabaseError {
	readonly _tag = "DatabaseError";
	constructor(readonly cause: unknown) {}
}

export class InvalidPrayerTypeError {
	readonly _tag = "InvalidPrayerTypeError";
	constructor(readonly prayerType: string) {}
}

// ============================================================================
// Prayer Types
// ============================================================================

export const VALID_PRAYER_TYPES = ["short", "medium", "long"] as const;
export type PrayerType = (typeof VALID_PRAYER_TYPES)[number];

const isValidPrayerType = (type: string): type is PrayerType =>
	VALID_PRAYER_TYPES.includes(type as PrayerType);

// ============================================================================
// Input Types
// ============================================================================

export interface GetHistoryInput {
	limit?: number;
	prayerType?: PrayerType;
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

// ============================================================================
// Retry Schedule - exponential backoff with 3 retries
// ============================================================================

const retrySchedule = Schedule.exponential("100 millis").pipe(
	Schedule.compose(Schedule.recurs(3)),
);

// ============================================================================
// Prayer Service Definition
// ============================================================================

export class PrayerService extends Context.Tag("PrayerService")<
	PrayerService,
	{
		readonly saveCompletion: (
			userId: string,
			prayerType: string,
		) => Effect.Effect<PrayerCompletion, DatabaseError | InvalidPrayerTypeError>;

		readonly getHistory: (
			userId: string,
			input?: GetHistoryInput,
		) => Effect.Effect<PrayerCompletion[], DatabaseError>;

		readonly getStats: (
			userId: string,
		) => Effect.Effect<PrayerStats, DatabaseError>;

		readonly getDashboardData: (
			userId: string,
			historyLimit?: number,
		) => Effect.Effect<DashboardData, DatabaseError>;
	}
>() {}

// ============================================================================
// Live Implementation (uses Prisma)
// ============================================================================

export const makePrayerServiceLive = (db: PrismaClient) =>
	Layer.succeed(PrayerService, {
		saveCompletion: (userId, prayerType) =>
			Effect.gen(function* () {
				// Validate prayer type
				if (!isValidPrayerType(prayerType)) {
					return yield* Effect.fail(new InvalidPrayerTypeError(prayerType));
				}

				// Save to database with retry for transient failures
				const completion = yield* Effect.tryPromise({
					try: () =>
						db.prayerCompletion.create({
							data: {
								userId,
								prayerType,
							},
						}),
					catch: (error) => new DatabaseError(error),
				}).pipe(Effect.retry(retrySchedule));

				yield* Effect.log(`Prayer completion saved: ${prayerType} for user ${userId}`);

				return completion;
			}),

		getHistory: (userId, input) =>
			Effect.gen(function* () {
				const completions = yield* Effect.tryPromise({
					try: () =>
						db.prayerCompletion.findMany({
							where: {
								userId,
								...(input?.prayerType && { prayerType: input.prayerType }),
							},
							orderBy: { completedAt: "desc" },
							take: input?.limit ?? 50,
						}),
					catch: (error) => new DatabaseError(error),
				}).pipe(Effect.retry(retrySchedule));

				yield* Effect.log(`Fetched ${completions.length} prayer completions for user ${userId}`);

				return completions;
			}),

		getStats: (userId) =>
			Effect.gen(function* () {
				// Fetch all completions with retry
				const completions = yield* Effect.tryPromise({
					try: () =>
						db.prayerCompletion.findMany({
							where: { userId },
							orderBy: { completedAt: "desc" },
						}),
					catch: (error) => new DatabaseError(error),
				}).pipe(Effect.retry(retrySchedule));

				// Count by prayer type
				const countByType = {
					short: completions.filter((c) => c.prayerType === "short").length,
					medium: completions.filter((c) => c.prayerType === "medium").length,
					long: completions.filter((c) => c.prayerType === "long").length,
				};

				// Calculate current streak
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				const completionsByDate = new Map<string, boolean>();
				for (const completion of completions) {
					const dateKey = completion.completedAt.toISOString().split("T")[0];
					if (dateKey) {
						completionsByDate.set(dateKey, true);
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

				yield* Effect.log(`Calculated stats for user ${userId}: ${completions.length} total, ${currentStreak} day streak`);

				return {
					total: completions.length,
					countByType,
					currentStreak,
					recentCompletions: completions.slice(0, 10),
				};
			}),

		getDashboardData: (userId, historyLimit = 20) =>
			Effect.gen(function* () {
				yield* Effect.log(`Fetching dashboard data for user ${userId}`);

				// Fetch stats and history in parallel for better performance
				const [stats, history] = yield* Effect.all(
					[
						// Get stats
						Effect.tryPromise({
							try: () =>
								db.prayerCompletion.findMany({
									where: { userId },
									orderBy: { completedAt: "desc" },
								}),
							catch: (error) => new DatabaseError(error),
						}).pipe(
							Effect.retry(retrySchedule),
							Effect.map((completions) => {
								const countByType = {
									short: completions.filter((c) => c.prayerType === "short").length,
									medium: completions.filter((c) => c.prayerType === "medium").length,
									long: completions.filter((c) => c.prayerType === "long").length,
								};

								const today = new Date();
								today.setHours(0, 0, 0, 0);

								const completionsByDate = new Map<string, boolean>();
								for (const completion of completions) {
									const dateKey = completion.completedAt.toISOString().split("T")[0];
									if (dateKey) {
										completionsByDate.set(dateKey, true);
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

								return {
									total: completions.length,
									countByType,
									currentStreak,
									recentCompletions: completions.slice(0, 10),
								};
							}),
						),
						// Get history
						Effect.tryPromise({
							try: () =>
								db.prayerCompletion.findMany({
									where: { userId },
									orderBy: { completedAt: "desc" },
									take: historyLimit,
								}),
							catch: (error) => new DatabaseError(error),
						}).pipe(Effect.retry(retrySchedule)),
					],
					{ concurrency: "unbounded" },
				);

				yield* Effect.log(`Dashboard data loaded: ${stats.total} total prayers, ${history.length} history items`);

				return { stats, history };
			}),
	});

// ============================================================================
// Helper to run Effects in tRPC procedures
// ============================================================================

export const runPrayerEffect = <A, E extends { _tag: string }>(
	db: PrismaClient,
	effect: (service: Context.Tag.Service<typeof PrayerService>) => Effect.Effect<A, E>,
) => {
	const layer = makePrayerServiceLive(db);
	const program = Effect.gen(function* () {
		const service = yield* PrayerService;
		return yield* effect(service);
	});

	return Effect.runPromise(Effect.provide(program, layer));
};
