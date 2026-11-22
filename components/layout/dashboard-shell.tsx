"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function DashboardShellInner({
  title,
  roleLabel,
  navItems,
  children,
  basePath,
}: {
  title: string;
  roleLabel: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
  basePath: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const match = navItems.find(
      (item) =>
        pathname === item.href ||
        (item.href !== basePath && pathname.startsWith(item.href)),
    );
    return match?.label ?? title;
  }, [navItems, pathname, basePath, title]);

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-white transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo href={basePath} light />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-sidebar-muted">
            Signed in as <span className="font-medium text-white">{roleLabel}</span>
            <br />
            Demo access only — no real authentication.
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== basePath && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            ← Back to website
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="rounded-lg border border-border p-2 text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {pageTitle}
            </p>
          </div>
          <div className="hidden max-w-xs flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search demo records…" className="pl-9" />
            </div>
          </div>
          <Link href={`${basePath}/notifications`}>
            <Button variant="outline" size="sm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-light-blue text-xs font-semibold text-primary">
                {roleLabel.slice(0, 1)}
              </span>
              <span className="hidden sm:inline">{roleLabel}</span>
              <ChevronDown className="h-4 w-4 text-muted" />
            </button>
            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white p-2 shadow-lg">
                <Link
                  href={`${basePath}/settings`}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => setProfileOpen(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => setProfileOpen(false)}
                >
                  Switch Role (Demo)
                </Link>
              </div>
            ) : null}
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function DashboardShellFallback({
  title,
  roleLabel,
  navItems,
  children,
  basePath,
}: {
  title: string;
  roleLabel: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
  basePath: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col bg-sidebar text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo href={basePath} light />
        </div>
        <div className="px-4 py-4">
          <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-sidebar-muted">
            Signed in as <span className="font-medium text-white">{roleLabel}</span>
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-white/90 px-4 sm:px-6">
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell(props: {
  title: string;
  roleLabel: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
  basePath: string;
}) {
  return (
    <Suspense fallback={<DashboardShellFallback {...props} />}>
      <DashboardShellInner {...props} />
    </Suspense>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
