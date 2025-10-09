import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Flame, BookOpen } from "lucide-react";
import { FloatingNavbar } from "@/components/floating-navbar";

export default async function HistoryPage() {
	const session = await auth();

	// Redirect unauthenticated users to landing page
	if (!session?.user) {
		redirect("/");
	}

	const stats = await api.prayer.getStats();
	const history = await api.prayer.getHistory({ limit: 20 });

	// Group completions by date for display
	const completionsByDate = history.reduce(
		(acc, completion) => {
			const dateKey = new Date(completion.completedAt).toLocaleDateString(
				"en-US",
				{
					year: "numeric",
					month: "long",
					day: "numeric",
				},
			);
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey]?.push(completion);
			return acc;
		},
		{} as Record<string, typeof history>,
	);

	return (
		<>
			<FloatingNavbar user={session.user} />
			<main className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-16 pt-24">
					<div className="mx-auto max-w-5xl">
						<div className="mb-12">
							{/* Stats Cards */}
							<div className="grid gap-4 md:grid-cols-3">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Current Streak
										</CardTitle>
										<Flame className="h-4 w-4 text-orange-500" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">
											{stats.currentStreak}
										</div>
										<p className="text-muted-foreground text-xs">days</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Total Prayers
										</CardTitle>
										<BookOpen className="h-4 w-4 text-blue-500" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">{stats.total}</div>
										<p className="text-muted-foreground text-xs">completed</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Prayer Types
										</CardTitle>
									</CardHeader>
									<CardContent>
										{stats.total > 0 ? (
											<div className="flex h-3 overflow-hidden rounded-full">
												{stats.countByType.short > 0 && (
													<div
														className="bg-gradient-to-r from-blue-500 to-cyan-500"
														style={{
															width: `${(stats.countByType.short / stats.total) * 100}%`,
														}}
														title={`Short: ${stats.countByType.short}`}
													/>
												)}
												{stats.countByType.medium > 0 && (
													<div
														className="bg-gradient-to-r from-purple-500 to-pink-500"
														style={{
															width: `${(stats.countByType.medium / stats.total) * 100}%`,
														}}
														title={`Medium: ${stats.countByType.medium}`}
													/>
												)}
												{stats.countByType.long > 0 && (
													<div
														className="bg-gradient-to-r from-amber-500 to-orange-500"
														style={{
															width: `${(stats.countByType.long / stats.total) * 100}%`,
														}}
														title={`Long: ${stats.countByType.long}`}
													/>
												)}
											</div>
										) : (
											<p className="text-muted-foreground text-sm">No prayers yet</p>
										)}
									</CardContent>
								</Card>
							</div>
						</div>

						{/* Recent Activity */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
							</CardHeader>
							<CardContent>
								{history.length === 0 ? (
									<div className="py-8 text-center text-muted-foreground">
										<p className="mb-4">No prayers completed yet</p>
										<Button asChild>
											<Link href="/home">Start Your First Prayer</Link>
										</Button>
									</div>
								) : (
									<div className="space-y-6">
										{Object.entries(completionsByDate).map(([date, completions]) => (
											<div key={date}>
												<h3 className="mb-3 font-semibold text-sm text-muted-foreground">
													{date}
												</h3>
												<div className="space-y-2">
													{completions.map((completion) => (
														<div
															key={completion.id}
															className="flex items-center justify-between rounded-lg border bg-card p-3 text-card-foreground"
														>
															<div className="flex items-center gap-3">
																<div
																	className={`h-2 w-2 rounded-full ${
																		completion.prayerType === "short"
																			? "bg-cyan-500"
																			: completion.prayerType === "medium"
																				? "bg-purple-500"
																				: "bg-amber-500"
																	}`}
																/>
																<span className="font-medium capitalize">
																	{completion.prayerType} Prayer
																</span>
															</div>
															<span className="text-muted-foreground text-sm">
																{new Date(completion.completedAt).toLocaleTimeString(
																	"en-US",
																	{
																		hour: "numeric",
																		minute: "2-digit",
																	},
																)}
															</span>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</>
	);
}
