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
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type * as React from "react";

interface FloatingNavbarProps extends React.HTMLAttributes<HTMLElement> {
	user?: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
}

export function FloatingNavbar({ className, user, ...props }: FloatingNavbarProps) {
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
			{/* Logo */}
			<Link
				href="/home"
				className="font-semibold text-primary text-sm transition-colors hover:text-primary/90"
			>
				Cosmic Tree
			</Link>

			<div className="h-4 w-px bg-border" />

			{/* Controls */}
			<div className="flex items-center gap-2">
				<ThemeToggle />
				{user && (
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
						<DropdownMenuContent align="end" className="w-56">
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
							<DropdownMenuItem asChild>
								<Link href="/profile" className="cursor-pointer">
									<UserIcon className="mr-2 h-4 w-4" />
									Profile
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/settings" className="cursor-pointer">
									<SettingsIcon className="mr-2 h-4 w-4" />
									Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="cursor-pointer text-destructive focus:text-destructive"
								onClick={() => signOut({ callbackUrl: "/" })}
							>
								<LogOutIcon className="mr-2 h-4 w-4" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</nav>
	);
}
