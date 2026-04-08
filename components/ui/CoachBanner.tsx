import MaterialIcon from "@/components/icons/MaterialIcon";

interface CoachBannerProps {
  title: string;
  message: string;
}

export default function CoachBanner({ title, message }: CoachBannerProps) {
  return (
    <div className="relative flex items-start gap-4 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-surface-container-low p-5 shadow-sm">
      <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
      <MaterialIcon 
        name="verified_user" 
        filled 
        className="text-primary mt-0.5" 
      />
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary glow-blue">
          {title}
        </h4>
        <p className="text-sm font-bold leading-relaxed italic text-on-surface">
          {message}
        </p>
      </div>
    </div>
  );
}
