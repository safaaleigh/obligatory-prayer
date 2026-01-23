import { Effect, Context, Layer } from "effect";
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

				// Save to database
				const completion = yield* Effect.tryPromise({
					try: () =>
						db.prayerCompletion.create({
							data: {
								userId,
								prayerType,
							},
						}),
					catch: (error) => new DatabaseError(error),
				});

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
				});

				yield* Effect.log(`Fetched ${completions.length} prayer completions for user ${userId}`);

				return completions;
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
