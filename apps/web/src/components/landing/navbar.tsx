"use client";
import { Menu, X } from "lucide-react";
import { COLORS } from "./constants";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [
    { label: "Home", href: "#" },
    { label: "Why Us?", href: "#difference" },
    { label: "Services", href: "#services" },
    { label: "Edit My Essay", href: "#" },
    { label: "Media", href: "#" },
    { label: "Free Tools", href: "#" },
  ];

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-lg backdrop-blur-md" : "bg-white"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo.avif"
              alt="ElevatEd Logo"
              className="h-10 w-auto"
              width={40}
              height={40}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="flex items-center gap-2">
              <span
                className="font-display text-2xl"
                style={{ color: COLORS.secondary }}
              >
                ElevatEd
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative font-medium text-[#101D45] transition-colors hover:text-[#FE4300]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#FE4300] transition-all group-hover:w-full" />
              </a>
            ))}
            <button
              className="px-6 py-2.5 font-semibold text-white transition-all hover:scale-105"
              style={{
                backgroundColor: COLORS.primary,
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
              }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t-2 border-[#101D45] bg-white lg:hidden">
          <div className="space-y-3 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2 font-medium text-[#101D45] hover:text-[#FE4300]"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              className="mt-4 w-full px-6 py-3 font-semibold text-white"
              style={{ backgroundColor: COLORS.primary }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
