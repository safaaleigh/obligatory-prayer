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
import {
	HomeIcon,
	LogOutIcon,
	Menu,
	SettingsIcon,
	UserIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
	user?: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
}

export function Navbar({ className, user, ...props }: NavbarProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6",
				className,
			)}
			{...props}
		>
			<div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
				{/* Logo */}
				<Link
					href={user ? "/home" : "/"}
					className="flex items-center space-x-2 text-primary transition-colors hover:text-primary/90"
				>
					<span className="font-bold text-xl">Cosmic Tree</span>
				</Link>

				{/* Right side */}
				<div className="flex items-center gap-3">
					<ThemeToggle />
					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground"
								>
									<Avatar className="h-7 w-7">
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
					) : (
						<>
							<Button
								variant="ghost"
								size="sm"
								asChild
								className="font-medium text-sm"
							>
								<Link href="/auth/signin">Sign In</Link>
							</Button>
							<Button size="sm" asChild className="font-medium text-sm">
								<Link href="/auth/signup">Sign Up</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
