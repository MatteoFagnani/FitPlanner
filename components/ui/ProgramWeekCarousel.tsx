"use client";

import MaterialIcon from "@/components/icons/MaterialIcon";
import { Week } from "@/lib/types";
import { useState } from "react";

interface ProgramWeekCarouselProps {
  weeks: Week[];
  activeWeekIdx: number;
  onSelectWeek: (index: number) => void;
  onAddWeek: () => void;
  onRemoveWeek: () => void;
  accentButtonClass: string;
}

export default function ProgramWeekCarousel({
  weeks,
  activeWeekIdx,
  onSelectWeek,
  onAddWeek,
  onRemoveWeek,
  accentButtonClass,
}: ProgramWeekCarouselProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeWeek = weeks[activeWeekIdx] ?? weeks[0];

  const goToPreviousWeek = () => {
    onSelectWeek(Math.max(0, activeWeekIdx - 1));
  };

  const goToNextWeek = () => {
    onSelectWeek(Math.min(weeks.length - 1, activeWeekIdx + 1));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const deltaX = event.changedTouches[0]?.clientX - touchStartX;
    setTouchStartX(null);

    if (deltaX <= -40) {
      goToNextWeek();
    }

    if (deltaX >= 40) {
      goToPreviousWeek();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-between gap-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={onRemoveWeek}
          disabled={weeks.length <= 1}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest text-outline disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MaterialIcon name="remove" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-on-surface sm:text-2xl">
            Week {activeWeek?.order ?? activeWeekIdx + 1}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-outline">
            {activeWeekIdx + 1} / {weeks.length}
          </p>
        </div>

        <button
          type="button"
          onClick={onAddWeek}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm ${accentButtonClass}`}
        >
          <MaterialIcon name="add" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goToPreviousWeek}
          disabled={activeWeekIdx === 0}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest text-outline disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MaterialIcon name="arrow_back_ios_new" className="text-sm" />
        </button>
        <button
          type="button"
          onClick={goToNextWeek}
          disabled={activeWeekIdx === weeks.length - 1}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest text-outline disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MaterialIcon name="arrow_forward_ios" className="text-sm" />
        </button>
      </div>
    </div>
  );
}
