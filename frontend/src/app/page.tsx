"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

export default function LandingPage() {
  const { isLoggedIn } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-75 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 mb-4">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>AI-Powered Personal Knowledge Base</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight italic">
          Today I <span className="text-blue-500">Learned.</span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Add topics and let them for AI research. Simple, fast, aur organized.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl transition-all hover:scale-105">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl transition-all hover:scale-105">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-zinc-800 text-lg px-8 py-6 rounded-xl hover:bg-zinc-900">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <BookOpen className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="font-bold text-lg mb-2">Smart Logging</h3>
          <p className="text-zinc-500 text-sm">Add title.</p>
        </div>
        
      </div>
    </div>
  );
}