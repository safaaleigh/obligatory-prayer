import { redirect } from "next/navigation";

import { FloatingNavbar } from "@/components/floating-navbar";
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
						Cosmic <span className="text-primary">Tree</span>
					</h1>
					<p className="text-center text-muted-foreground text-xl">
						Welcome to Cosmic Tree
					</p>
				</div>
			</main>
		</>
	);
}
