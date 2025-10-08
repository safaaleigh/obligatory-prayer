import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction, signUpAction } from "../actions";

export default async function SignUpPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const params = await searchParams;

	async function handleSignUp(formData: FormData) {
		"use server";

		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			redirect("/auth/signup?error=Passwords do not match");
		}

		const result = await signUpAction(formData);

		if (result.error) {
			redirect(`/auth/signup?error=${encodeURIComponent(result.error)}`);
		}

		// Sign in after successful signup
		await signInAction(formData);
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Sign Up</CardTitle>
					<CardDescription>Create a new account to get started</CardDescription>
				</CardHeader>
				<form action={handleSignUp}>
					<CardContent className="space-y-4">
						{params.error && (
							<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
								{params.error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="John Doe"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="you@example.com"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								minLength={8}
							/>
							<p className="text-muted-foreground text-xs">
								Must be at least 8 characters
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
							/>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-4">
						<Button type="submit" className="w-full">
							Sign Up
						</Button>
						<p className="text-center text-muted-foreground text-sm">
							Already have an account?{" "}
							<Link
								href="/auth/signin"
								className="text-primary hover:underline"
							>
								Sign in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
