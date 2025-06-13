"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { isAuthenticated } from "@/src/lib/auth";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const segment = useSelectedLayoutSegment();

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const navLinks = isAuth
    ? [
        { href: "/dashboard", label: "Dashboard", segment: "dashboard" },
        { href: "/try", label: "Try Demo", segment: "try" },
        { href: "/plans", label: "Plans", segment: "plans" }
      ]
    : [
        { href: "/plans", label: "Plans", segment: "plans" },
        { href: "/try", label: "Try Demo", segment: "try" }
      ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-glass-border backdrop-blur-xl">
      <nav className="container mx-auto flex items-center justify-between px-6 py-5 md:px-8 lg:px-12" aria-label="Main navigation">
        {/* Logo and brand */}
        <Link href="/" className="flex items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl group transition-all duration-300">
          <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center glow-effect group-hover:scale-110 transition-transform duration-300">
            <span className="text-xl">⚡</span>
          </div>
          <span className="text-2xl font-bold hidden sm:inline-block text-gradient">
            BugCatcher
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-500 relative overflow-hidden ${
                segment === link.segment
                  ? "premium-gradient text-white glow-effect"
                  : "text-foreground-muted hover:text-foreground glass-card hover:glow-effect"
              }`}
              aria-current={segment === link.segment ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-3 rounded-xl glass-card text-foreground hover:glow-effect transition-all duration-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <HiX className="h-6 w-6" aria-hidden="true" />
          ) : (
            <HiMenu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-6 pt-6 pb-8 space-y-4 border-t border-glass-border glass-card">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-500 ${
                  segment === link.segment
                    ? "premium-gradient text-white glow-effect"
                    : "text-foreground-muted hover:text-foreground glass-card hover:glow-effect"
                }`}
                aria-current={segment === link.segment ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
