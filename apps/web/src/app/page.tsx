"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10">
      <pre className="overflow-x-auto font-mono text-4xl">
        Aniketh Chenjeri: Take Home Interview
      </pre>
      <div className="grid gap-6">
        <section className="rounded-lg p-4">
          <Link href="/dashboard" className="group block">
            <Card className="group-hover:border-primary transition-all duration-300 group-hover:shadow-lg">
              <CardContent className="flex flex-row items-center justify-between">
                <CardTitle className="group-hover:text-primary text-2xl transition-colors duration-300">
                  Dashboard For Takehome Interview
                </CardTitle>

                <ChevronRight className="group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/landing" className="group block">
            <Card className="group-hover:border-primary transition-all duration-300 group-hover:shadow-lg">
              <CardContent className="flex flex-row items-center justify-between">
                <CardTitle className="group-hover:text-primary text-2xl transition-colors duration-300">
                  Redesigned Landing Page + Custom Editor Flow
                </CardTitle>

                <ChevronRight className="group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/technical-report" className="group block">
            <Card className="group-hover:border-primary transition-all duration-300 group-hover:shadow-lg">
              <CardContent className="flex flex-row items-center justify-between">
                <CardTitle className="group-hover:text-primary text-2xl transition-colors duration-300">
                  Technical Report
                </CardTitle>

                <ChevronRight className="group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        </section>
      </div>
    </div>
  );
}
