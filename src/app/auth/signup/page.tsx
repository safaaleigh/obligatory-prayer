import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
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
			<div className="mx-auto w-full max-w-sm space-y-8">
				<div className="space-y-3 text-center">
					<h1 className="font-semibold text-3xl">Create account</h1>
					<p className="text-muted-foreground text-sm">
						Join us to get started
					</p>
				</div>

				<form action={handleSignUp} className="space-y-5">
					{params.error && (
						<div className="rounded-full bg-destructive/10 px-4 py-2 text-center text-destructive text-sm">
							{params.error}
						</div>
					)}

					<Input
						id="name"
						name="name"
						type="text"
						placeholder="Name"
						className="rounded-full"
						required
					/>

					<Input
						id="email"
						name="email"
						type="email"
						placeholder="Email"
						className="rounded-full"
						required
					/>

					<Input
						id="password"
						name="password"
						type="password"
						placeholder="Password (min 8 characters)"
						className="rounded-full"
						required
						minLength={8}
					/>

					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						placeholder="Confirm password"
						className="rounded-full"
						required
					/>

					<Button type="submit" className="w-full rounded-full" size="lg">
						Create account
						<Sparkles className="ml-2 h-4 w-4" />
					</Button>

					<p className="text-center text-muted-foreground text-sm">
						Already have an account?{" "}
						<Link href="/auth/signin" className="text-primary hover:underline">
							Sign in
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
