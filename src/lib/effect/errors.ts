/**
 * Shared typed errors for the prayer application.
 * These are used across both Prisma and Convex implementations.
 */

export class DatabaseError {
	readonly _tag = "DatabaseError";
	constructor(readonly cause: unknown) {}
}

export class ValidationError {
	readonly _tag = "ValidationError";
	constructor(readonly message: string) {}
}

export class NotFoundError {
	readonly _tag = "NotFoundError";
	constructor(readonly resource: string, readonly id: string) {}
}

export class UnauthorizedError {
	readonly _tag = "UnauthorizedError";
	constructor(readonly message: string = "Not authenticated") {}
}

export class InvalidPrayerTypeError {
	readonly _tag = "InvalidPrayerTypeError";
	constructor(readonly prayerType: string) {}
}

// Union type of all errors for convenience
export type AppError =
	| DatabaseError
	| ValidationError
	| NotFoundError
	| UnauthorizedError
	| InvalidPrayerTypeError;
