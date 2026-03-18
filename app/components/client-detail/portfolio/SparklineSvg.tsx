import React from "react";

interface SparklineSvgProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export default function SparklineSvg({ data, positive, width = 48, height = 16 }: SparklineSvgProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i * width) / (data.length - 1)},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
      />
    </svg>
  );
}
