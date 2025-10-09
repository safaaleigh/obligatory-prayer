import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { prayers } from "@/data/prayers";

export default async function HomePage() {
	const session = await auth();

	// Redirect unauthenticated users to landing page
	if (!session?.user) {
		redirect("/");
	}

	const prayerOptions = [
		{
			id: "short",
			...prayers.short,
			color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
		},
		{
			id: "medium",
			...prayers.medium,
			color: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
		},
		{
			id: "long",
			...prayers.long,
			color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
		},
	];

	return (
		<main className="min-h-screen bg-background flex items-center justify-center">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h1 className="mb-4 font-bold text-4xl tracking-tight sm:text-5xl">
							Select Your Prayer
						</h1>
						<p className="text-muted-foreground text-lg">
							Select which obligatory prayer you would like to recite today
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{prayerOptions.map((prayer) => (
							<Link key={prayer.id} href={`/pray/${prayer.id}`}>
								<Card
									className={`bg-gradient-to-br ${prayer.color} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
								>
									<CardContent className="flex items-center justify-center p-6">
										<h2 className="font-semibold text-xl capitalize">
											{prayer.id}
										</h2>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
