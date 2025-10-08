import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { signInAction } from "../actions";

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const params = await searchParams;

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="mx-auto w-full max-w-sm space-y-8">
				<div className="space-y-3 text-center">
					<h1 className="font-semibold text-3xl">Welcome back</h1>
					<p className="text-muted-foreground text-sm">
						Enter your credentials to continue
					</p>
				</div>

				<form action={signInAction} className="space-y-5">
					{params.error && (
						<div className="rounded-full bg-destructive/10 px-4 py-2 text-center text-destructive text-sm">
							{params.error}
						</div>
					)}

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
						placeholder="Password"
						className="rounded-full"
						required
					/>

					<Button type="submit" className="w-full rounded-full" size="lg">
						Continue
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>

					<p className="text-center text-muted-foreground text-sm">
						Need an account?{" "}
						<Link href="/auth/signup" className="text-primary hover:underline">
							Sign up
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
