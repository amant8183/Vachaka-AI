"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { tokens } from "@/lib/design-tokens";

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav
      className="w-full fixed top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${tokens.colors.border}` : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight group"
          style={{ color: tokens.colors.textPrimary }}
        >
          {/* Sound Wave Logo */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {/* Outer rings - sound waves */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="2"
                opacity="0.4"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="url(#gradient2)"
                strokeWidth="2"
                opacity="0.5"
              />
              <circle
                cx="50"
                cy="50"
                r="31"
                fill="none"
                stroke="url(#gradient3)"
                strokeWidth="2"
                opacity="0.6"
              />

              {/* Inner circle background */}
              <circle
                cx="50"
                cy="50"
                r="24"
                fill="rgba(220, 38, 38, 0.1)"
                stroke="rgba(220, 38, 38, 0.5)"
                strokeWidth="1.5"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f87171" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hindi character */}
            <span
              className="relative text-xl font-bold z-10 transition-transform duration-200 group-hover:scale-110"
              style={{
                color: tokens.colors.textPrimary,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              व
            </span>
          </div>
          <span className="hidden sm:inline">Vachaka AI</span>
        </Link>

        {/* Navigation Links - visible on all screen sizes */}
        <div className="flex gap-4 sm:gap-6 md:gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs sm:text-sm font-medium transition-all duration-300 relative group/link"
              style={{
                color:
                  pathname === link.href
                    ? tokens.colors.textPrimary
                    : tokens.colors.textSecondary,
              }}
            >
              {link.name}
              {/* Active underline */}
              {pathname === link.href && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: tokens.colors.userPrimary }}
                />
              )}
              {/* Hover underline for inactive links */}
              {pathname !== link.href && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ backgroundColor: tokens.colors.userPrimary }}
                />
              )}
            </Link>
          ))}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
