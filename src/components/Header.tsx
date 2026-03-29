"use client";

import { Bell, Search, LogOut, Loader2 } from "lucide-react";
import { AppUser } from "@/app/page";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentUser?: AppUser;
}

export function Header({ title, subtitle, currentUser }: HeaderProps) {
  const initials = currentUser?.name?.split(" ").map((n) => n[0]).join("") || "?";
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex min-h-[4rem] shrink-0 items-center justify-between gap-3 border-b border-surface-border/80 bg-surface/90 px-4 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75 sm:gap-4 sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1 pr-2">
        <h2 className="app-header-title font-display truncate text-lg font-semibold leading-tight tracking-tight text-on-surface sm:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-on-surface-variant sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
        {/* Global Search */}
        <div className="relative hidden h-10 items-center md:flex">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/80" />
          <input
            type="search"
            placeholder="Search expenses, users..."
            aria-label="Search"
            className="h-10 w-52 rounded-full border border-surface-border/90 bg-surface-lowest/90 py-0 pl-9 pr-4 text-sm leading-none text-on-surface shadow-inner shadow-on-surface/[0.02] transition-all placeholder:text-on-surface-variant/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 lg:w-64"
          />
        </div>

        {/* Action Icons */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Notifications"
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface-lowest bg-primary ring-1 ring-primary/30" />
        </button>

        <div className="mx-0.5 hidden h-8 w-px bg-surface-border/90 sm:block" />

        {/* User Profile */}
        <div className="group ml-0 flex items-center gap-2 sm:ml-1 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-[9rem] truncate text-sm font-medium leading-tight text-on-surface lg:max-w-[12rem]">
              {currentUser?.name || "Loading..."}
            </p>
            <p className="max-w-[9rem] truncate text-[11px] leading-tight text-on-surface-variant lg:max-w-[12rem]">
              {currentUser?.department || "—"}
            </p>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary ring-2 ring-primary/18 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="User menu"
          >
            {initials}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-10 items-center gap-2 rounded-full border border-surface-border/90 bg-surface-lowest/80 px-2.5 text-error transition-colors hover:border-error/25 hover:bg-error hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error sm:px-3.5"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="hidden text-sm font-medium sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
