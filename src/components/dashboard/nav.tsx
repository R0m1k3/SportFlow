"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavProps {
  links: {
    href: string;
    label: string;
    icon: LucideIcon;
  }[];
  isMobile: boolean;
}

export function Nav({ links, isMobile }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("grid items-start gap-2 px-2 text-sm font-medium lg:px-4", isMobile && "mt-4")}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === link.href && "bg-muted text-primary"
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}