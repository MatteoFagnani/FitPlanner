"use client";

import { useState } from "react";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { cn } from "@/lib/utils";

interface WeekSectionProps {
  weekNumber: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function WeekSection({
  weekNumber,
  defaultExpanded = true,
  children,
}: WeekSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="rounded-[2rem] border border-outline-variant/80 bg-white p-4 shadow-sm sm:p-5">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-3 border-b border-outline-variant/70 pb-4 text-left"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Week {weekNumber}
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-on-surface sm:text-xl">
            Piano Settimanale
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-outline-variant/80 bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-outline sm:block">
            {isExpanded ? "Aperta" : "Chiusa"}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MaterialIcon
              name={isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              className={cn("text-xl transition-transform", !isExpanded && "translate-y-px")}
            />
          </div>
        </div>
      </button>

      {isExpanded && <div className="mt-4 space-y-4">{children}</div>}
    </section>
  );
}
