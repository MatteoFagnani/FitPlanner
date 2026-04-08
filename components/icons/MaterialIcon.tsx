interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

export default function MaterialIcon({ 
  name, 
  filled = false, 
  className = "" 
}: MaterialIconProps) {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      data-icon={name}
    >
      {name}
    </span>
  );
}
