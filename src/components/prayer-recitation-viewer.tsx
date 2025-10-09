"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FloatingNavbar } from "./floating-navbar";
import { Particles } from "./ui/particles";
import { api } from "@/trpc/react";
import type { Prayer } from "@/data/prayers";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Sprout, House, BookHeart } from "lucide-react";

interface PrayerRecitationViewerProps {
	prayer: Prayer;
	userId: string;
	user?: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
}

export function PrayerRecitationViewer({
	prayer,
	user,
}: PrayerRecitationViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isCompleted, setIsCompleted] = useState(false);
	const router = useRouter();

	const saveCompletionMutation = api.prayer.saveCompletion.useMutation({
		onSuccess: () => {
			setIsCompleted(true);
		},
	});

	const scrollToPhrase = useCallback((index: number) => {
		if (!containerRef.current) return;

		const container = containerRef.current;
		const targetScroll = index * window.innerHeight;

		container.scrollTo({
			top: targetScroll,
			behavior: "smooth",
		});

		// Update current index immediately for Safari
		setCurrentIndex(index);
	}, []);

	// Check if user has reached the completion phrase (last phrase)
	useEffect(() => {
		if (
			currentIndex === prayer.phrases.length - 1 &&
			!isCompleted &&
			!saveCompletionMutation.isPending
		) {
			// Save completion when they reach the "Prayer completed" phrase
			saveCompletionMutation.mutate({ prayerType: prayer.id });
		}
	}, [currentIndex, prayer.phrases.length, prayer.id, isCompleted, saveCompletionMutation]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "ArrowRight") {
				e.preventDefault();
				const nextIndex = Math.min(
					currentIndex + 1,
					prayer.phrases.length - 1,
				);
				scrollToPhrase(nextIndex);
			} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
				e.preventDefault();
				const prevIndex = Math.max(currentIndex - 1, 0);
				scrollToPhrase(prevIndex);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentIndex, prayer.phrases.length, scrollToPhrase]);

	// Track current phrase using Intersection Observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const index = Number(entry.target.getAttribute("data-index"));
						setCurrentIndex(index);
					}
				});
			},
			{
				threshold: 0.5,
				root: containerRef.current,
			},
		);

		const phraseElements =
			containerRef.current?.querySelectorAll("[data-phrase]");
		phraseElements?.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, [prayer.phrases]);

	return (
		<>
			{/* Floating Navbar */}
			<FloatingNavbar user={user} />

			{/* Progress indicator */}
			<div className="pointer-events-none fixed bottom-6 right-6 z-10 rounded-full border bg-background/80 px-3 py-1 font-medium text-sm shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
				{currentIndex + 1} / {prayer.phrases.length}
			</div>

			{/* Particles background - fixed position */}
			<Particles
				className="fixed inset-0"
				quantity={100}
				ease={80}
				staticity={50}
				size={0.8}
			/>

			{/* Scrollable container */}
			<div
				ref={containerRef}
				className="fixed inset-0 snap-y snap-mandatory overflow-y-scroll"
				style={{
					scrollbarWidth: "none",
					msOverflowStyle: "none",
					WebkitOverflowScrolling: "touch",
				}}
			>
				{prayer.phrases.map((phrase, index) => {
					const isLastPhrase = index === prayer.phrases.length - 1;

					return (
						<div
							key={index}
							data-phrase
							data-index={index}
							className="relative z-10 flex min-h-screen w-full snap-start items-center justify-center px-6 sm:px-12"
							style={{
								scrollSnapStop: "always",
								height: "100dvh",
							}}
						>
							{isLastPhrase ? (
								<div className="flex flex-col items-center gap-12">
									<Sprout className="h-48 w-48 text-primary animate-pulse" />
									<div className="flex gap-4">
										<Button
											size="lg"
											variant="outline"
											onClick={() => router.push("/home")}
											className="h-16 w-16 rounded-full p-0"
											disabled={!isCompleted}
										>
											<House className="h-6 w-6" />
											<span className="sr-only">Back to Home</span>
										</Button>
										<Button
											size="lg"
											variant="outline"
											onClick={() => router.push("/history")}
											className="h-16 w-16 rounded-full p-0"
											disabled={!isCompleted}
										>
											<BookHeart className="h-6 w-6" />
											<span className="sr-only">View History</span>
										</Button>
									</div>
								</div>
							) : phrase.type === "instruction" ? (
								<p className="max-w-3xl text-center italic text-lg text-muted-foreground leading-relaxed sm:text-xl">
									{phrase.text}
								</p>
							) : (
								<p className="max-w-3xl text-center font-medium text-2xl leading-relaxed sm:text-3xl md:text-4xl">
									{phrase.text}
								</p>
							)}
						</div>
					);
				})}
			</div>

			{/* Hide scrollbar */}
			<style jsx>{`
				div::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</>
	);
}
