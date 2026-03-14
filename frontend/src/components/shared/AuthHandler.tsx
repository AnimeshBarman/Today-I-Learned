"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthHandler({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, accessToken } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && (!isLoggedIn || !accessToken)) {
      router.push("/login");
    }
  }, [hydrated, isLoggedIn, accessToken, router]);

  if (!hydrated) return <p className="text-white p-10">Loading...</p>;
  if (!isLoggedIn || !accessToken) return <p className="text-white p-10">Loading...</p>;

  return <>{children}</>;
}