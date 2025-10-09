"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DoorOpen, History, Home, Lamp, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

interface FloatingNavbarProps extends React.HTMLAttributes<HTMLElement> {
	user?: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
}

export function FloatingNavbar({ className, user, ...props }: FloatingNavbarProps) {
	const pathname = usePathname();
	const isSignInPage = pathname === "/auth/signin";

	return (
		<nav
			className={cn(
				"fixed top-6 left-1/2 z-50 -translate-x-1/2",
				"flex items-center gap-3 rounded-full border bg-background/80 px-4 py-2 shadow-lg backdrop-blur-md",
				"supports-[backdrop-filter]:bg-background/60",
				className,
			)}
			{...props}
		>
			{/* Controls */}
			<div className="flex items-center gap-2">
				<ThemeToggle />
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-8 w-8 rounded-full p-0 hover:bg-accent hover:text-accent-foreground"
							>
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={user.image ?? undefined}
										alt={user.name ?? "User"}
									/>
									<AvatarFallback className="text-xs">
										{user.name
											?.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase() ??
											user.email?.[0]?.toUpperCase() ??
											"U"}
									</AvatarFallback>
								</Avatar>
								<span className="sr-only">User menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center" className="w-56 rounded-2xl">
							<DropdownMenuLabel>
								<div className="flex flex-col space-y-1">
									<p className="font-medium text-sm leading-none">
										{user.name ?? "User"}
									</p>
									<p className="text-muted-foreground text-xs leading-none">
										{user.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild className="cursor-pointer">
								<Link href="/home">
									<Home className="mr-2 h-4 w-4" />
									Home
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild className="cursor-pointer">
								<Link href="/history">
									<History className="mr-2 h-4 w-4" />
									History
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="cursor-pointer text-destructive focus:text-destructive"
								onClick={() => signOut({ callbackUrl: "/" })}
							>
								<Lamp className="mr-2 h-4 w-4" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : isSignInPage ? (
					<Button
						asChild
						variant="ghost"
						className="h-8 w-8 rounded-full p-0 hover:bg-accent hover:text-accent-foreground"
					>
						<Link href="/auth/signup">
							<Sparkles className="h-4 w-4" />
							<span className="sr-only">Sign Up</span>
						</Link>
					</Button>
				) : (
					<Button
						asChild
						variant="ghost"
						className="h-8 w-8 rounded-full p-0 hover:bg-accent hover:text-accent-foreground"
					>
						<Link href="/auth/signin">
							<DoorOpen className="h-4 w-4" />
							<span className="sr-only">Sign In</span>
						</Link>
					</Button>
				)}
			</div>
		</nav>
	);
}
