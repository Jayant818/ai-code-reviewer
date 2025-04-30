"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelectedLayoutSegment } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const segment = useSelectedLayoutSegment();

  const navLinks = [
    { href: "/connect-github", label: "Connect GitHub", segment: "connect-github" },
    { href: "/try", label: "Try It", segment: "try" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm dark:bg-gray-900 dark:border-b dark:border-gray-800">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6 lg:px-8" aria-label="Main navigation">
        {/* Logo and brand */}
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md">
          <Image 
            src="/logo.png" 
            alt="BugCatcher Logo" 
            width={48} 
            height={48}
            className="rounded-md"
            priority
          />
          <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline-block">
            BugCatcher
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                segment === link.segment 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
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
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
          <div className="px-2 pt-2 pb-3 space-y-1 border-t dark:border-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  segment === link.segment
                    ? "bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
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
