import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const session = await auth();

	// Redirect unauthenticated users to landing page
	if (!session?.user) {
		redirect("/");
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-background">
			<div className="container flex flex-col items-center justify-center gap-4 px-4 py-16">
				<h1 className="font-extrabold text-4xl tracking-tight">
					Welcome back, {session.user.name}!
				</h1>
			</div>
		</main>
	);
}
