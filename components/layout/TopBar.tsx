import MaterialIcon from "@/components/icons/MaterialIcon";

export default function TopBar() {
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
      <div className="flex items-center">
        <div className="hidden text-right sm:block">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
            Training System
          </p>
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-outline/60">
            v2.4.0 stable
          </p>
        </div>
      </div>
    </header>
  );
}
