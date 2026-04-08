"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser && pathname !== "/login") {
      router.push("/login");
    }
  }, [currentUser, pathname, router]);

  const isLoginPage = pathname === "/login";

  if (!currentUser && !isLoginPage) return null;

  return (
    <>
      {!isLoginPage && <TopBar />}
      <main className={!isLoginPage ? "pb-24 pt-16" : ""}>
        {children}
      </main>
      {!isLoginPage && <BottomNav />}
    </>
  );
}
