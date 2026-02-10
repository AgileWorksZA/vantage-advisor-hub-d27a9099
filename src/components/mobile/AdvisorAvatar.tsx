import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AdvisorData } from "@/data/regionalData";
import advisorMale from "@/assets/advisor-male.jpg";
import advisorFemale from "@/assets/advisor-female.jpg";

interface AdvisorAvatarProps {
  advisor: AdvisorData | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

const textSizeMap = {
  sm: "text-[10px]",
  md: "text-sm",
  lg: "text-xl",
};

const AdvisorAvatar = ({ advisor, size = "sm", className }: AdvisorAvatarProps) => {
  if (!advisor) return null;

  const photoSrc = advisor.photoUrl || (advisor.gender === "female" ? advisorFemale : advisorMale);

  return (
    <Avatar className={cn(sizeMap[size], "border-2 border-primary/20", className)}>
      <AvatarImage src={photoSrc} alt={advisor.name} />
      <AvatarFallback className={cn(textSizeMap[size], "bg-primary/20 text-primary font-semibold")}>
        {advisor.initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default AdvisorAvatar;
