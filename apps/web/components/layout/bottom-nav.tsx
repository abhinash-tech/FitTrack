"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Droplets,
  Dumbbell,
  Utensils,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/cn"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/hydration", label: "Water", icon: Droplets },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/nutrition", label: "Food", icon: Utensils },
  { href: "/more", label: "More", icon: MoreHorizontal },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[hsl(var(--background-surface))] border-t border-[hsl(var(--border))] pb-safe lg:hidden">
      <div className="flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-150"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[hsl(var(--primary))]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
