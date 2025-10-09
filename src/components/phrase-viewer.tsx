"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Particles } from "./ui/particles";

interface PhraseViewerProps {
	phrases: string[];
}

export function PhraseViewer({ phrases }: PhraseViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [currentIndex, setCurrentIndex] = useState(0);

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

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "ArrowRight") {
				e.preventDefault();
				const nextIndex = Math.min(currentIndex + 1, phrases.length - 1);
				scrollToPhrase(nextIndex);
			} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
				e.preventDefault();
				const prevIndex = Math.max(currentIndex - 1, 0);
				scrollToPhrase(prevIndex);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentIndex, phrases.length, scrollToPhrase]);

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

		const phraseElements = containerRef.current?.querySelectorAll(
			"[data-phrase]",
		);
		phraseElements?.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, [phrases]);

	return (
		<>
			{/* Progress indicator */}
			<div className="pointer-events-none fixed bottom-6 right-6 z-10 rounded-full border bg-background/80 px-3 py-1 font-medium text-sm shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
				{currentIndex + 1} / {phrases.length}
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
				{phrases.map((phrase, index) => (
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
						<p className="max-w-3xl text-center font-medium text-2xl leading-relaxed sm:text-3xl md:text-4xl">
							{phrase}
						</p>
					</div>
				))}
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
