"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
	className?: string;
	quantity?: number;
	staticity?: number;
	ease?: number;
	size?: number;
	refresh?: boolean;
	color?: string;
	vx?: number;
	vy?: number;
}

interface Particle {
	x: number;
	y: number;
	translateX: number;
	translateY: number;
	size: number;
	alpha: number;
	targetAlpha: number;
	dx: number;
	dy: number;
	magnetism: number;
}

export function Particles({
	className = "",
	quantity = 100,
	staticity = 50,
	ease = 50,
	size = 0.4,
	refresh = false,
	color = "#ffffff",
	vx = 0,
	vy = 0,
}: ParticlesProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const context = useRef<CanvasRenderingContext2D | null>(null);
	const circles = useRef<Particle[]>([]);
	const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const mouseMoveRef = useRef<(e: MouseEvent) => void>();
	const rafRef = useRef<number>();
	const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

	useEffect(() => {
		if (!canvasContainerRef.current) return;

		const container = canvasContainerRef.current;
		const updateSize = () => {
			setCanvasSize({
				w: container.offsetWidth,
				h: container.offsetHeight,
			});
		};

		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		context.current = canvas.getContext("2d");
		if (!context.current) return;

		// Initialize particles
		circles.current = Array.from({ length: quantity }, () => ({
			x: Math.random() * canvasSize.w,
			y: Math.random() * canvasSize.h,
			translateX: 0,
			translateY: 0,
			size: Math.random() * size + size / 2,
			alpha: 0,
			targetAlpha: Math.random() * 0.6 + 0.1,
			dx: (Math.random() - 0.5) * 0.1 + vx * 0.1,
			dy: (Math.random() - 0.5) * 0.1 + vy * 0.1,
			magnetism: 0.1 + Math.random() * 4,
		}));

		// Mouse move handler
		const onMouseMove = (e: MouseEvent) => {
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			mousePosition.current = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		};

		mouseMoveRef.current = onMouseMove;
		window.addEventListener("mousemove", onMouseMove);

		return () => {
			if (mouseMoveRef.current) {
				window.removeEventListener("mousemove", mouseMoveRef.current);
			}
		};
	}, [canvasSize.w, canvasSize.h, quantity, refresh, size, vx, vy]);

	useEffect(() => {
		const animate = () => {
			if (!context.current || !canvasRef.current) return;

			const ctx = context.current;
			const canvas = canvasRef.current;

			ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

			circles.current.forEach((circle) => {
				// Handle mouse attraction
				const edge = [
					circle.x + circle.translateX - circle.size,
					canvasSize.w - circle.x - circle.translateX - circle.size,
					circle.y + circle.translateY - circle.size,
					canvasSize.h - circle.y - circle.translateY - circle.size,
				];
				const closestEdge = edge.reduce((a, b) => Math.min(a, b));
				const remapClosestEdge = parseFloat(
					((closestEdge / canvasSize.w) * 100).toFixed(2),
				);

				if (remapClosestEdge > 20) {
					circle.alpha += 0.02;
					if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
				} else {
					circle.alpha = circle.targetAlpha * remapClosestEdge / 20;
				}

				// Update position with drift
				circle.x += circle.dx;
				circle.y += circle.dy;

				// Mouse attraction physics
				const dx = mousePosition.current.x - (circle.x + circle.translateX);
				const dy = mousePosition.current.y - (circle.y + circle.translateY);
				const distance = Math.sqrt(dx * dx + dy * dy);
				const attractionForce = (100 - staticity) / 100;

				if (distance < canvasSize.w / 2) {
					const pull = (1 - distance / (canvasSize.w / 2)) * attractionForce;
					circle.translateX += dx * pull * circle.magnetism * 0.01;
					circle.translateY += dy * pull * circle.magnetism * 0.01;
				}

				// Easing
				circle.translateX *= ease / 100;
				circle.translateY *= ease / 100;

				// Edge detection and regeneration
				if (
					circle.x < -circle.size ||
					circle.x > canvasSize.w + circle.size ||
					circle.y < -circle.size ||
					circle.y > canvasSize.h + circle.size
				) {
					circle.x = Math.random() * canvasSize.w;
					circle.y = Math.random() * canvasSize.h;
					circle.translateX = 0;
					circle.translateY = 0;
					circle.alpha = 0;
				}

				// Draw particle
				ctx.beginPath();
				ctx.arc(
					circle.x + circle.translateX,
					circle.y + circle.translateY,
					circle.size,
					0,
					2 * Math.PI,
				);
				ctx.fillStyle = color;
				ctx.globalAlpha = circle.alpha;
				ctx.fill();
			});

			rafRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [canvasSize.w, canvasSize.h, color, ease, staticity]);

	return (
		<div className={cn("pointer-events-none", className)} ref={canvasContainerRef}>
			<canvas
				ref={canvasRef}
				width={canvasSize.w}
				height={canvasSize.h}
				className="h-full w-full"
			/>
		</div>
	);
}
