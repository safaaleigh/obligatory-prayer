import { FloatingNavbar } from "@/components/floating-navbar";
import { auth } from "@/server/auth";

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	return (
		<>
			<FloatingNavbar user={session?.user} />
			{children}
		</>
	);
}
