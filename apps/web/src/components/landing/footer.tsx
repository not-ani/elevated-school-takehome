import { GraduationCap } from "lucide-react";
import { COLORS } from "./constants";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t-4 border-[#FE4300] bg-[#FDF8F3] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Image
                src="/logo.avif"
                alt="ElevatEd Logo"
                className="h-10 w-auto"
                width={40}
                height={40}
              />
              <div className="flex items-center gap-2">
                <GraduationCap
                  className="h-8 w-8"
                  style={{ color: COLORS.primary }}
                />
                <span
                  className="font-display text-2xl"
                  style={{ color: COLORS.secondary }}
                >
                  ElevatEd
                </span>
              </div>
            </div>
            <p className="mb-6 max-w-sm text-[#101D45]/70">
              Empowering students to become the best versions of themselves
              through personalized mentorship and education.
            </p>
            <button
              className="px-6 py-3 font-bold text-white transition-all hover:scale-105"
              style={{
                backgroundColor: COLORS.primary,
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
              }}
            >
              Get Started Today
            </button>
          </div>

          {/* Links */}
          <div>
            <h4
              className="font-display mb-4 text-lg"
              style={{ color: COLORS.secondary }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                "Home",
                "Why Us?",
                "Services",
                "Edit My Essay",
                "Media",
                "Free Tools",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-[#101D45]/70 transition-colors hover:text-[#FE4300]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-display mb-4 text-lg"
              style={{ color: COLORS.secondary }}
            >
              Contact
            </h4>
            <ul className="space-y-2 text-[#101D45]/70">
              <li>Email: info@elevatedschool.com</li>
              <li>WeChat: ElevatEdMentors</li>
              <li>WhatsApp: Available</li>
              <li className="mt-4 text-sm">Response time: Within 48 hours</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#101D45]/10 pt-8 md:flex-row">
          <p className="text-sm text-[#101D45]/50">
            © 2024 ElevatEd School. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-[#101D45]/50 hover:text-[#FE4300]"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-[#101D45]/50 hover:text-[#FE4300]"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
