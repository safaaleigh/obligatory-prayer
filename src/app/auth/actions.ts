"use server";

import { signIn } from "@/server/auth";
import { db } from "@/server/db";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!name || !email || !password) {
		redirect("/auth/signup?error=Missing required fields");
	}

	if (password.length < 8) {
		redirect("/auth/signup?error=Password must be at least 8 characters");
	}

	try {
		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			redirect("/auth/signup?error=User with this email already exists");
		}

		// Hash password
		const hashedPassword = await hash(password, 10);

		// Create user
		await db.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		// Sign in after successful signup
		await signIn("credentials", {
			email,
			password,
			redirectTo: "/home",
		});
	} catch (error) {
		console.error("Signup error:", error);
		redirect("/auth/signup?error=An error occurred while creating your account");
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
