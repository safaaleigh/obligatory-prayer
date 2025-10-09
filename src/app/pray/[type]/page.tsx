import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { prayers } from "@/data/prayers";
import { PrayerRecitationViewer } from "@/components/prayer-recitation-viewer";

type Props = {
	params: Promise<{ type: string }>;
};

export default async function PrayerRecitationPage({ params }: Props) {
	const session = await auth();
	const { type } = await params;

	// Redirect unauthenticated users to landing page
	if (!session?.user) {
		redirect("/");
	}

	// Validate prayer type
	if (!["short", "medium", "long"].includes(type)) {
		redirect("/home");
	}

	const prayer = prayers[type as keyof typeof prayers];

	if (!prayer) {
		redirect("/home");
	}

	return (
		<main className="bg-background">
			<PrayerRecitationViewer
				prayer={prayer}
				userId={session.user.id ?? ""}
				user={session.user}
			/>
		</main>
	);
}
