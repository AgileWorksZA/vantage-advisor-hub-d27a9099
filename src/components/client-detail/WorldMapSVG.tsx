import React from "react";
import {
  greenland,
  northAmerica,
  southAmerica,
  europe,
  africa,
  asia,
  oceania,
} from "@/data/worldMapDots";

interface WorldMapSVGProps {
  className?: string;
}

const dotClass = "fill-[hsl(180,30%,85%)] dark:fill-[hsl(180,20%,25%)]";
const R = 1.6;

const allDots = [
  { dots: northAmerica, key: "na" },
  { dots: southAmerica, key: "sa" },
  { dots: europe, key: "eu" },
  { dots: africa, key: "af" },
  { dots: asia, key: "as" },
  { dots: oceania, key: "oc" },
  { dots: greenland, key: "gr" },
];

const WorldMapSVG: React.FC<WorldMapSVGProps> = ({ className }) => (
  <svg
    viewBox="0 0 1000 500"
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    {allDots.map(({ dots, key }) =>
      dots.map(([cx, cy], i) => (
        <circle key={`${key}-${i}`} cx={cx} cy={cy} r={R} className={dotClass} />
      ))
    )}
  </svg>
);

export default WorldMapSVG;
