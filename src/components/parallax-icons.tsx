"use client";

import { useEffect, useState } from "react";
import {
	Sparkles,
	Star,
	Circle,
	Zap,
	Heart,
	Cloud,
	Moon,
	Sun,
	Leaf,
	Flower,
	type LucideIcon,
} from "lucide-react";

interface IconConfig {
	Icon: LucideIcon;
	top: number;
	left: number;
	size: number;
	opacity: number;
	layer: number; // 0 = slowest, 1 = medium, 2 = fastest
	horizontalDirection: number; // -1 to 1, controls left/right drift
	rotation: number; // initial rotation angle
}

const ICON_COMPONENTS = [
	Sparkles,
	Star,
	Circle,
	Zap,
	Heart,
	Cloud,
	Moon,
	Sun,
	Leaf,
	Flower,
];

// Parallax speed multipliers for each layer
const LAYER_SPEEDS = [0.2, 0.5, 1];

interface ParallaxIconsProps {
	scrollY: number;
	phraseCount: number;
}

export function ParallaxIcons({ scrollY, phraseCount }: ParallaxIconsProps) {
	const [icons, setIcons] = useState<IconConfig[]>([]);

	// Generate random icon configurations on mount
	useEffect(() => {
		const generateIcons = () => {
			const iconConfigs: IconConfig[] = [];
			// More icons per phrase to ensure coverage throughout scroll
			const iconsPerPhrase = 6;
			const iconCount = phraseCount * iconsPerPhrase;

			for (let i = 0; i < iconCount; i++) {
				const Icon = ICON_COMPONENTS[Math.floor(Math.random() * ICON_COMPONENTS.length)];

				iconConfigs.push({
					Icon: Icon!,
					// Distribute across entire scroll height (phraseCount * 100vh)
					top: Math.random() * phraseCount * 100, // 0 to (phraseCount * 100)vh
					left: Math.random() * 100, // 0-100% of viewport width
					size: 32 + Math.random() * 64, // 32-96px
					opacity: 0.1 + Math.random() * 0.3, // 0.1-0.4
					layer: Math.floor(Math.random() * 3), // 0, 1, or 2
					horizontalDirection: (Math.random() - 0.5) * 2, // -1 to 1
					rotation: Math.random() * 360, // 0-360 degrees
				});
			}

			setIcons(iconConfigs);
		};

		generateIcons();
	}, [phraseCount]);

	return (
		<div
			className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
			style={{
				height: `${phraseCount * 100}vh`,
			}}
		>
			{icons.map((config, index) => {
				const { Icon, top, left, size, opacity, layer, horizontalDirection, rotation } = config;
				const speed = LAYER_SPEEDS[layer]!;

				// Vertical parallax movement (increased multiplier for more dramatic effect)
				const translateY = scrollY * (speed - 1) * 0.5;

				// Horizontal drift based on scroll and layer (increased for more visibility)
				const horizontalSpeed = speed * 0.5; // 50% of vertical speed
				const translateX = scrollY * horizontalSpeed * horizontalDirection * 0.3;

				// Subtle rotation based on scroll
				const rotateAngle = rotation + (scrollY * 0.05 * horizontalDirection);

				return (
					<Icon
						key={index}
						size={size}
						className="absolute"
						style={{
							top: `${top}vh`,
							left: `${left}%`,
							opacity,
							transform: `translate(${translateX}px, ${translateY}px) rotate(${rotateAngle}deg)`,
							willChange: "transform",
						}}
					/>
				);
			})}
		</div>
	);
}
