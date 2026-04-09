"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthResolved = useStore((state) => state.isAuthResolved);
  const currentUser = useStore((state) => state.currentUser);
  const initializeSession = useStore((state) => state.initializeSession);
  const hydrateCurrentUserFromDatabase = useStore((state) => state.hydrateCurrentUserFromDatabase);
  const hydrateProgramsFromDatabase = useStore((state) => state.hydrateProgramsFromDatabase);

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (!isAuthResolved) return;

    if (!currentUser && pathname !== "/login") {
      router.push("/login");
      return;
    }

    if (currentUser && pathname === "/login") {
      router.push("/");
    }
  }, [currentUser, isAuthResolved, pathname, router]);

  useEffect(() => {
    if (!currentUser?.id) return;

    void hydrateCurrentUserFromDatabase();
    void hydrateProgramsFromDatabase();
  }, [currentUser?.id, hydrateCurrentUserFromDatabase, hydrateProgramsFromDatabase]);

  const isLoginPage = pathname === "/login";

  if (!isAuthResolved && !isLoginPage) return null;
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
