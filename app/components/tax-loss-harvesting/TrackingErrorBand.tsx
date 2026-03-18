interface TrackingErrorBandProps {
  value: number;
}

export const TrackingErrorBand = ({ value }: TrackingErrorBandProps) => {
  const maxPercent = 0.08; // 8% scale
  const position = Math.min((value / maxPercent) * 100, 100);

  const ticks = [
    { label: "0%", pos: 0 },
    { label: "2%", pos: 25 },
    { label: "4%", pos: 50 },
    { label: "6%", pos: 75 },
    { label: "> 8%", pos: 100 },
  ];

  return (
    <div className="space-y-1">
      {/* SVG Band Visualization */}
      <div className="relative w-full" style={{ height: 48 }}>
        <svg
          viewBox="0 0 400 48"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ display: "block" }}
        >
          {/* Widening cone / confidence band */}
          <polygon
            points="0,24 400,0 400,48 0,24"
            fill="hsla(220, 70%, 80%, 0.35)"
          />
          {/* Center line */}
          <line
            x1="0"
            y1="24"
            x2="400"
            y2="24"
            stroke="#9ca3af"
            strokeWidth="1"
          />
        </svg>

        {/* Vertical marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{
            left: `${position}%`,
            backgroundColor: "#1f2937",
          }}
        >
          <div
            className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: "#1f2937" }}
          />
        </div>
      </div>

      {/* Tick labels */}
      <div className="relative h-4">
        {ticks.map((tick) => (
          <span
            key={tick.label}
            className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
            style={{ left: `${tick.pos}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
};
