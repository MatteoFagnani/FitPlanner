import WeekSection from "@/components/ui/WeekSection";

interface WeekCardProps {
  weekNumber: number;
  title: string;
  status: "active" | "locked" | "future";
  isExpanded?: boolean;
  children?: React.ReactNode;
}

export default function WeekCard(props: WeekCardProps) {
  if (!props.isExpanded || !props.children) {
    return null;
  }

  return <WeekSection weekNumber={props.weekNumber}>{props.children}</WeekSection>;
}