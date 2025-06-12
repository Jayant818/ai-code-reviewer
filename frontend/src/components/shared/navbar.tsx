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
        { href: "/try", label: "Try Demo", segment: "try" }
      ]
    : [
        { href: "/connect-github", label: "Connect", segment: "connect-github" },
        { href: "/try", label: "Try Demo", segment: "try" }
      ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-border backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6 lg:px-8" aria-label="Main navigation">
        {/* Logo and brand */}
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md group">
          <div className="w-10 h-10 fire-gradient rounded-lg flex items-center justify-center">
            <span className="text-lg">🔥</span>
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">
            BugCatcher
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                segment === link.segment
                  ? "fire-gradient text-white"
                  : "text-muted-foreground hover:text-foreground hover:fire-glow"
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
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-300"
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
          <div className="px-4 pt-4 pb-6 space-y-2 border-t border-border glass-card">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  segment === link.segment
                    ? "fire-gradient text-white"
                    : "text-muted-foreground hover:text-foreground hover:fire-glow"
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
