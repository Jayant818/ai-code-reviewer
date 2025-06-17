"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "@/lib/hooks";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const segment = useSelectedLayoutSegment();
  const { isAuthenticated, logout } = useAuth();


  const navLinks = isAuthenticated
    ? [
      // { href: "/dashboard", label: "Dashboard", segment: "dashboard", target:"_parent" },
      { href: "/profile", label: "Profile", segment: "profile", target:"_parent" }
    ]
    : [
      { href: "/try", label: "Experience Demo", segment: "try", target:"_blank" },
      { href: "/plans", label: "Plans", segment: "plans", target:"_parent" }
    ];

  return (
    <header className="sticky top-0 z-50 w-full  h-fit">
      <nav className="container mx-auto flex items-center justify-between  px-4 py-2 w-full md:w-fit space-x-4 rounded-none md:rounded-4xl glass-card border-glass-border backdrop-blur-xl md:mt-4  " aria-label="Main navigation">
        {/* Logo and brand */}
        <Link href="/" className="flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl group transition-all duration-300">
          <div className="flex items-center gap-4 ">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center glow-effect group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl">⚡</span>
            </div>
            <span className="lg:block text-lg font-bold hidden sm:inline-block text-gradient ">
              BugCatcher
            </span>
          </div>
          <span className="hidden lg:inline-block w-16 h-[2px] premium-gradient mx-auto rounded-full"></span>

        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.target}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-500 relative overflow-hidden ${
                segment === link.segment
                  ? "premium-gradient text-white glow-effect rounded-4xl"
                  : " hover:glow-effect"
              }`}
              aria-current={segment === link.segment ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}

            <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="http://localhost:3001/auth/github/login"
              className="fire-gradient text-white px-4 py-2 rounded-lg font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
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
             <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="http://localhost:3001/auth/github/login"
            className="fire-gradient text-white px-4 py-2 rounded-lg font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
          </div>
        </div>
      )}
    </header>
  );
}
