import MaterialIcon from "@/components/icons/MaterialIcon";

export default function TopBar() {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/80 bg-white/92 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <MaterialIcon name="precision_manufacturing" className="text-xl" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary glow-blue">
            FitPlanner
          </p>
          <h1 className="text-base font-black uppercase tracking-tight text-on-surface">
            Kinetic Ledger
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
            Training System
          </p>
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-outline/60">
            v2.4.0 stable
          </p>
        </div>
        <div className="h-8 w-px bg-outline-variant/70" />
        <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.45)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-green-700">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}
