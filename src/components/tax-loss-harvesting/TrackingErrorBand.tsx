interface TrackingErrorBandProps {
  value: number;
  target: number;
}

export const TrackingErrorBand = ({ value, target }: TrackingErrorBandProps) => {
  const maxPercent = 8;
  const valuePercent = Math.min((value * 100) / maxPercent, 100);
  const targetPercent = Math.min((target * 100) / maxPercent, 100);
  const ticks = [0, 2, 4, 6, 8];

  return (
    <div className="space-y-3">
      <div className="relative h-8">
        {/* Background band */}
        <div className="absolute inset-y-1 left-0 right-0 rounded bg-muted" />
        {/* Target zone (shaded) */}
        <div
          className="absolute inset-y-1 left-0 rounded"
          style={{
            width: `${targetPercent}%`,
            background: "hsla(180, 70%, 45%, 0.15)",
          }}
        />
        {/* Current value marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{
            left: `${valuePercent}%`,
            background: "hsl(180, 70%, 45%)",
          }}
        >
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2"
            style={{
              background: "hsl(180, 70%, 45%)",
              borderColor: "hsl(180, 70%, 45%)",
            }}
          />
        </div>
        {/* Target marker */}
        <div
          className="absolute top-0 bottom-0 w-px border-l border-dashed border-muted-foreground/40"
          style={{ left: `${targetPercent}%` }}
        />
      </div>
      {/* Tick labels */}
      <div className="relative h-4">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
            style={{ left: `${(tick / maxPercent) * 100}%` }}
          >
            {tick}%
          </span>
        ))}
        <span
          className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
          style={{ left: `${targetPercent}%` }}
        >
          Target
        </span>
      </div>
    </div>
  );
};
