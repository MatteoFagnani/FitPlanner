interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  valueClassName?: string;
}

export default function MetricCard({ 
  label, 
  value, 
  unit, 
  valueClassName = "" 
}: MetricCardProps) {
  return (
    <div className="p-5 border-r border-b border-outline-variant last:border-r-0 hover:bg-surface-container-low transition-colors group">
      <p className="text-[9px] font-black uppercase text-outline tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <p className={`text-3xl font-black tabular-nums tracking-tighter italic ${valueClassName}`}>
          {value}
        </p>
        {unit && <span className="text-[10px] font-bold text-outline uppercase">{unit}</span>}
      </div>
    </div>
  );
}
