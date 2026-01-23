import { Effect, Context, Layer, Schedule } from "effect";
import type { PrismaClient, User } from "@prisma/client";
import { hash } from "bcryptjs";

// ============================================================================
// Typed Errors
// ============================================================================

export class DatabaseError {
	readonly _tag = "DatabaseError";
	constructor(readonly cause: unknown) {}
}

export class EmailAlreadyExistsError {
	readonly _tag = "EmailAlreadyExistsError";
	constructor(readonly email: string) {}
}

export class ValidationError {
	readonly _tag = "ValidationError";
	constructor(readonly message: string) {}
}

export class UserNotFoundError {
	readonly _tag = "UserNotFoundError";
	constructor(readonly email: string) {}
}

// ============================================================================
// Input Types
// ============================================================================

export interface SignUpInput {
	name: string;
	email: string;
	password: string;
}

// ============================================================================
// Auth Service Definition
// ============================================================================

export class AuthService extends Context.Tag("AuthService")<
	AuthService,
	{
		readonly signUp: (
			input: SignUpInput,
		) => Effect.Effect<
			User,
			DatabaseError | EmailAlreadyExistsError | ValidationError
		>;

		readonly findUserByEmail: (
			email: string,
		) => Effect.Effect<User | null, DatabaseError>;
	}
>() {}

// ============================================================================
// Validation Helpers
// ============================================================================

const validateSignUpInput = (input: SignUpInput) =>
	Effect.gen(function* () {
		if (!input.name || !input.email || !input.password) {
			return yield* Effect.fail(new ValidationError("Missing required fields"));
		}

		if (input.password.length < 8) {
			return yield* Effect.fail(
				new ValidationError("Password must be at least 8 characters"),
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(input.email)) {
			return yield* Effect.fail(new ValidationError("Invalid email format"));
		}

		return input;
	});

// ============================================================================
// Live Implementation (uses Prisma)
// ============================================================================

export const makeAuthServiceLive = (db: PrismaClient) =>
	Layer.succeed(AuthService, {
		signUp: (input) =>
			Effect.gen(function* () {
				// Validate input
				const validInput = yield* validateSignUpInput(input);

				// Check if user already exists
				const existingUser = yield* Effect.tryPromise({
					try: () => db.user.findUnique({ where: { email: validInput.email } }),
					catch: (error) => new DatabaseError(error),
				});

				if (existingUser) {
					return yield* Effect.fail(
						new EmailAlreadyExistsError(validInput.email),
					);
				}

				// Hash password
				const hashedPassword = yield* Effect.tryPromise({
					try: () => hash(validInput.password, 10),
					catch: (error) => new DatabaseError(error),
				});

				// Create user with retry for transient failures
				const user = yield* Effect.tryPromise({
					try: () =>
						db.user.create({
							data: {
								name: validInput.name,
								email: validInput.email,
								password: hashedPassword,
							},
						}),
					catch: (error) => new DatabaseError(error),
				}).pipe(
					Effect.retry(
						Schedule.exponential("100 millis").pipe(
							Schedule.compose(Schedule.recurs(3)),
						),
					),
				);

				yield* Effect.log(`User created: ${user.email}`);

				return user;
			}),

		findUserByEmail: (email) =>
			Effect.tryPromise({
				try: () => db.user.findUnique({ where: { email } }),
				catch: (error) => new DatabaseError(error),
			}),
	});

// ============================================================================
// Helper to run Effects
// ============================================================================

export const runAuthEffect = <
	A,
	E extends { _tag: string },
>(
	db: PrismaClient,
	effect: (service: Context.Tag.Service<typeof AuthService>) => Effect.Effect<A, E>,
) => {
	const layer = makeAuthServiceLive(db);
	const program = Effect.gen(function* () {
		const service = yield* AuthService;
		return yield* effect(service);
	});

	return Effect.runPromise(Effect.provide(program, layer));
};
