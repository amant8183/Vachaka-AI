"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { tokens } from "@/lib/design-tokens";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav
      className="w-full sticky top-0 z-50"
      style={{
        backgroundColor: tokens.colors.surface,
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          style={{ color: tokens.colors.textPrimary }}
        >
          <span>Voice AI</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{
                color:
                  pathname === link.href
                    ? tokens.colors.textPrimary
                    : tokens.colors.textSecondary,
              }}
            >
              {link.name}
            </Link>
          ))}

          {/* Profile Icon */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5"
            style={{
              backgroundColor: tokens.colors.surfaceHover,
            }}
            title="Profile"
          >
            <span style={{ color: tokens.colors.textSecondary }}>👤</span>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl"
          style={{ color: tokens.colors.textPrimary }}
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          className="md:hidden flex flex-col items-center py-3"
          style={{
            backgroundColor: tokens.colors.surface,
            borderTop: `1px solid ${tokens.colors.border}`,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="py-2 font-medium transition-colors"
              style={{
                color:
                  pathname === link.href
                    ? tokens.colors.textPrimary
                    : tokens.colors.textSecondary,
              }}
            >
              {link.name}
            </Link>
          ))}
          <div
            className="mt-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: tokens.colors.surfaceHover,
            }}
          >
            <span style={{ color: tokens.colors.textSecondary }}>👤</span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
