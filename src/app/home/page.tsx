import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { PhraseViewer } from "@/components/phrase-viewer";
import { samplePhrases } from "@/data/sample-phrases";

export default async function HomePage() {
	const session = await auth();

	// Redirect unauthenticated users to landing page
	if (!session?.user) {
		redirect("/");
	}

	return (
		<main className="bg-background">
			<PhraseViewer phrases={samplePhrases} />
		</main>
	);
}
