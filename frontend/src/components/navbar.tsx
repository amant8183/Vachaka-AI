"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          <span role="img" aria-label="mic" className="text-3xl">
            🎙️
          </span>
          <span>Voice AI</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`md:hidden text-2xl p-2 rounded-lg transition-all duration-200 ${
            isOpen ? "bg-gray-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center bg-gray-50 border-t border-gray-200/50 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-center transition-all duration-200 ${
                pathname === link.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
