import React from "react";
import mapImage from "@/assets/world-dots-map.png";
import { cn } from "@/lib/utils";

interface WorldMapSVGProps {
  className?: string;
}

const WorldMapSVG: React.FC<WorldMapSVGProps> = ({ className }) => (
  <div className={cn("relative overflow-hidden", className)}>
    <img
      src={mapImage}
      alt=""
      className="w-full h-full object-contain opacity-[0.18] dark:invert dark:opacity-[0.08]"
      draggable={false}
    />
  </div>
);

export default WorldMapSVG;
