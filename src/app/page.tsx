import { redirect } from "next/navigation";
import Link from "next/link";

import { FloatingNavbar } from "@/components/floating-navbar";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";

export default async function Home() {
	const session = await auth();

	// Redirect authenticated users to /home
	if (session?.user) {
		redirect("/home");
	}

	return (
		<>
			<FloatingNavbar user={session?.user} />
			<main className="flex min-h-screen flex-col items-center justify-center">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						Obligatory <span className="text-primary">Prayer</span>
					</h1>
					<p className="text-center text-muted-foreground text-xl">
						Your daily companion for reciting Bahá'í obligatory prayers
					</p>
					<div className="flex gap-4">
						<Button size="lg" asChild>
							<Link href="/auth/signup">Get Started</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link href="/auth/signin">Sign In</Link>
						</Button>
					</div>
				</div>
			</main>
		</>
	);
}
