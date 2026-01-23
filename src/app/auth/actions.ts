"use server";

import { signIn } from "@/server/auth";
import { db } from "@/server/db";
import {
	runAuthEffect,
	EmailAlreadyExistsError,
	ValidationError,
} from "@/server/services/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	try {
		// Use Effect-based auth service for signup
		await runAuthEffect(db, (service) =>
			service.signUp({ name, email, password }),
		);

		// Sign in after successful signup
		await signIn("credentials", {
			email,
			password,
			redirectTo: "/home",
		});
	} catch (error) {
		// Handle Effect errors
		if (error instanceof ValidationError) {
			redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
		}
		if (error instanceof EmailAlreadyExistsError) {
			redirect("/auth/signup?error=User with this email already exists");
		}
		// NextAuth throws NEXT_REDIRECT error on success
		if (error instanceof AuthError) {
			redirect("/auth/signup?error=An error occurred while creating your account");
		}
		// Re-throw redirect errors
		throw error;
	}
}

export async function signInAction(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		redirect("/auth/signin?error=Missing email or password");
	}

	try {
		await signIn("credentials", {
			email,
			password,
			redirectTo: "/home",
		});
	} catch (error) {
		// NextAuth throws NEXT_REDIRECT error on success
		if (error instanceof AuthError) {
			redirect("/auth/signin?error=Invalid email or password");
		}
		// Re-throw redirect errors
		throw error;
	}
}
