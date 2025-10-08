"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<Button
			variant="ghost"
			className="h-8 w-8 rounded-full p-0 hover:bg-accent hover:text-accent-foreground"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			aria-label="Toggle theme"
		>
			<Sun className="dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0" />
			<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
