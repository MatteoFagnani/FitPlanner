"use client";

import { useStore } from "@/lib/store/useStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "@/components/icons/MaterialIcon";

export default function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  if (!currentUser) return null;

  const isCoach = currentUser.role === "coach";

  const navItems = [
    { 
      label: "Allenamento", 
      icon: "fitness_center", 
      href: "/", 
      active: pathname === "/" 
    },
    ...(isCoach ? [{ 
      label: "Programmi", 
      icon: "architecture", 
      href: "/programs", 
      active: pathname.startsWith("/programs") 
    }] : []),
    { 
      label: "Profilo", 
      icon: "person", 
      href: "/profile", 
      active: pathname === "/profile" 
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/80 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)] backdrop-blur-xl shadow-[0_-10px_30px_rgba(15,23,42,0.08)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.35rem)" }}
    >
      <div className="mx-auto flex h-20 max-w-md items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex w-20 flex-col items-center justify-center gap-1"
          >
            <div
              className={`flex items-center justify-center transition-all duration-300 ${
                item.active 
                  ? "h-12 w-12 scale-110 rounded-2xl bg-primary text-white shadow-lg glow-sm" 
                  : "h-11 w-11 rounded-2xl border border-transparent text-outline group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary"
              }`}
            >
              <MaterialIcon 
                name={item.icon} 
                className={item.active ? "text-xl" : "text-2xl"}
                filled={item.active}
              />
            </div>
            <span
              className={`text-[8px] font-black uppercase tracking-[0.3em] transition-colors ${
                item.active ? "text-primary glow-blue" : "text-outline"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
