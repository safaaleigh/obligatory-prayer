import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
		<main className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-16 pt-24">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h1 className="mb-4 font-bold text-4xl tracking-tight sm:text-5xl">
							Choose Your Prayer
						</h1>
						<p className="text-muted-foreground text-lg">
							Select which obligatory prayer you would like to recite today
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{prayerOptions.map((prayer) => (
							<Card
								key={prayer.id}
								className={`bg-gradient-to-br ${prayer.color} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
							>
								<CardHeader>
									<CardTitle className="text-2xl">{prayer.title}</CardTitle>
									<CardDescription className="text-base">
										{prayer.timing}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-muted-foreground text-sm">
										{prayer.description}
									</p>
									<Button asChild className="w-full">
										<Link href={`/pray/${prayer.id}`}>
											Begin Prayer
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="mt-12 text-center">
						<Button variant="outline" asChild>
							<Link href="/history">View Prayer History</Link>
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
