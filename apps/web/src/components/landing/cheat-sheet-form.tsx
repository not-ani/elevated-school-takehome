"use client";

import { useState } from "react";
import { COLORS } from "./constants";
import { Download, Check, ChevronDown, ArrowRight } from "lucide-react";

type CheatSheetFormData = {
  userType: string;
  grade: string;
  email: string;
};

export function CheatSheetForm() {
  const [formData, setFormData] = useState<CheatSheetFormData>({
    userType: "",
    grade: "",
    email: "",
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
  };

  if (isFormSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center"
          style={{ backgroundColor: COLORS.accent }}
        >
          <Check className="h-8 w-8" style={{ color: COLORS.secondary }} />
        </div>
        <h4 className="mb-2 text-lg font-bold text-white">Check Your Email!</h4>
        <p className="mb-4 text-sm text-white/70">
          We&apos;ve sent the cheat sheet to your inbox
        </p>
        <button
          onClick={() => {
            setIsFormSubmitted(false);
            setFormData({ userType: "", grade: "", email: "" });
          }}
          className="text-sm text-white/50 underline underline-offset-4 transition-colors hover:text-white"
        >
          Download for someone else
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        {["Student", "Parent"].map((type) => (
          <label
            key={type}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 border-2 px-3 py-3 transition-all"
            style={{
              borderColor:
                formData.userType === type
                  ? COLORS.primary
                  : "rgba(255,255,255,0.2)",
              backgroundColor:
                formData.userType === type
                  ? `${COLORS.primary}20`
                  : "transparent",
            }}
            onClick={() => setFormData({ ...formData, userType: type })}
          >
            <div
              className="flex h-4 w-4 items-center justify-center border transition-colors"
              style={{
                borderColor:
                  formData.userType === type
                    ? COLORS.primary
                    : "rgba(255,255,255,0.4)",
              }}
            >
              {formData.userType === type && (
                <div
                  className="h-2 w-2"
                  style={{ backgroundColor: COLORS.primary }}
                />
              )}
            </div>
            <span className="text-sm font-medium text-white">{type}</span>
          </label>
        ))}
      </div>

      <div className="relative">
        <select
          value={formData.grade}
          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
          className="w-full appearance-none border-2 bg-transparent px-4 py-3.5 text-sm text-white transition-colors outline-none"
          style={{
            borderColor: formData.grade
              ? COLORS.primary
              : "rgba(255,255,255,0.2)",
          }}
        >
          <option value="" className="bg-[#101D45] text-white/50">
            Select Grade Level
          </option>
          <option value="9" className="bg-[#101D45]">
            9th Grade
          </option>
          <option value="10" className="bg-[#101D45]">
            10th Grade
          </option>
          <option value="11" className="bg-[#101D45]">
            11th Grade
          </option>
          <option value="12" className="bg-[#101D45]">
            12th Grade
          </option>
          <option value="parent" className="bg-[#101D45]">
            Parent
          </option>
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-white/50" />
      </div>

      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email address"
        className="w-full border-2 bg-transparent px-4 py-3.5 text-sm text-white transition-colors outline-none placeholder:text-white/40"
        style={{
          borderColor: formData.email
            ? COLORS.primary
            : "rgba(255,255,255,0.2)",
        }}
        required
      />

      <button
        type="submit"
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden px-6 py-4 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: COLORS.primary,
          boxShadow: `0 4px 20px ${COLORS.primary}40`,
          clipPath: "polygon(0 0, 100% 0, 100% 85%, 96% 100%, 0 100%)",
        }}
        disabled={!formData.userType || !formData.grade || !formData.email}
      >
        <Download className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Download Now</span>
        <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>

      <p className="text-center text-xs text-white/40">
        No spam, unsubscribe anytime. We respect your privacy.
      </p>
    </form>
  );
}
