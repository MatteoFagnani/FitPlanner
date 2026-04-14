 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { useStore } from "@/lib/store/useStore";

export default function TopBar() {
  const pathname = usePathname();
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return null;
  }

  const navItems = [
    ...(currentUser.role === "coach"
      ? [
          {
            label: "Programmi",
            icon: "architecture",
            href: "/programs",
            active: pathname.startsWith("/programs"),
          },
        ]
      : []),
    {
      label: "Profilo",
      icon: "person",
      href: "/profile",
      active: pathname === "/profile",
    },
  ];

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/80 bg-white/92 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <MaterialIcon name="precision_manufacturing" className="text-xl" />
        </div>
        <h1 className="text-base font-black uppercase tracking-[0.2em] text-on-surface sm:text-lg">
          FitPlanner
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors ${
              item.active
                ? "border-primary/20 bg-primary text-white shadow-sm"
                : "border-outline-variant bg-surface-container-lowest text-outline hover:border-primary/20 hover:text-primary"
            }`}
          >
            <MaterialIcon name={item.icon} className="text-lg" filled={item.active} />
          </Link>
        ))}
      </div>
    </header>
  );
}
