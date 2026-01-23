/**
 * Tests for error classes.
 * Ensures all error types are properly instantiated and have correct tags.
 */

import { describe, expect, test } from "bun:test";
import {
	DatabaseError,
	ValidationError,
	NotFoundError,
	UnauthorizedError,
	InvalidPrayerTypeError,
} from "../src/lib/effect";

describe("Error classes", () => {
	test("DatabaseError has correct tag and stores cause", () => {
		const cause = new Error("DB connection failed");
		const error = new DatabaseError(cause);

		expect(error._tag).toBe("DatabaseError");
		expect(error.cause).toBe(cause);
	});

	test("ValidationError has correct tag and message", () => {
		const error = new ValidationError("Invalid input");

		expect(error._tag).toBe("ValidationError");
		expect(error.message).toBe("Invalid input");
	});

	test("NotFoundError has correct tag, resource, and id", () => {
		const error = new NotFoundError("User", "123");

		expect(error._tag).toBe("NotFoundError");
		expect(error.resource).toBe("User");
		expect(error.id).toBe("123");
	});

	test("UnauthorizedError has correct tag and default message", () => {
		const error = new UnauthorizedError();

		expect(error._tag).toBe("UnauthorizedError");
		expect(error.message).toBe("Not authenticated");
	});

	test("UnauthorizedError accepts custom message", () => {
		const error = new UnauthorizedError("Session expired");

		expect(error._tag).toBe("UnauthorizedError");
		expect(error.message).toBe("Session expired");
	});

	test("InvalidPrayerTypeError has correct tag and prayerType", () => {
		const error = new InvalidPrayerTypeError("invalid");

		expect(error._tag).toBe("InvalidPrayerTypeError");
		expect(error.prayerType).toBe("invalid");
	});
});
