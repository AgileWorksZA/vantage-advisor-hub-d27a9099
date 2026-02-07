import { useState, useMemo } from "react";
import ReactEChartsCore from "echarts-for-react";
import { Slider } from "@/components/ui/slider";

interface TrackingErrorBandProps {
  value: number;
  target: number;
  timeline?: { date: string; value: number }[];
}

export const TrackingErrorBand = ({ value, target, timeline }: TrackingErrorBandProps) => {
  const maxPercent = 8;
  const ticks = [0, 2, 4, 6, 8];

  // Slider state: [startIndex, endIndex] as percentages of timeline length
  const timelineLength = timeline?.length || 0;
  const [range, setRange] = useState<number[]>([0, 100]);

  const filteredTimeline = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];
    const startIdx = Math.floor((range[0] / 100) * (timeline.length - 1));
    const endIdx = Math.ceil((range[1] / 100) * (timeline.length - 1));
    return timeline.slice(startIdx, endIdx + 1);
  }, [timeline, range]);

  // The "current" tracking error value is the last point in the filtered range
  const displayValue = filteredTimeline.length > 0
    ? filteredTimeline[filteredTimeline.length - 1].value
    : value;

  const valuePercent = Math.min((displayValue * 100) / (maxPercent / 100), 100);
  const targetPercent = Math.min((target * 100) / (maxPercent / 100), 100);

  // Date range labels
  const startLabel = filteredTimeline.length > 0
    ? new Date(filteredTimeline[0].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";
  const endLabel = filteredTimeline.length > 0
    ? new Date(filteredTimeline[filteredTimeline.length - 1].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  const chartOption = useMemo(() => {
    if (filteredTimeline.length === 0) return {};
    const dates = filteredTimeline.map(p => {
      const d = new Date(p.date);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
    const values = filteredTimeline.map(p => +(p.value * 100).toFixed(3));
    const maxY = Math.max(...values, target * 100) * 1.3;

    return {
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(30,30,30,0.9)",
        borderColor: "transparent",
        textStyle: { color: "#fff", fontSize: 12 },
        formatter: (params: Array<{ value: number; name: string }>) => {
          if (Array.isArray(params) && params.length > 0) {
            return `${params[0].name}: ${params[0].value.toFixed(3)}%`;
          }
          return "";
        },
      },
      grid: { left: 50, right: 20, top: 15, bottom: 30 },
      xAxis: {
        type: "category" as const,
        data: dates,
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#9ca3af", fontSize: 10, interval: Math.max(0, Math.floor(dates.length / 6) - 1) },
      },
      yAxis: {
        type: "value" as const,
        min: 0,
        max: parseFloat(maxY.toFixed(2)),
        axisLine: { show: false },
        splitLine: { lineStyle: { color: "#f3f4f6" } },
        axisLabel: { color: "#9ca3af", fontSize: 10, formatter: (v: number) => `${v.toFixed(1)}%` },
      },
      series: [
        {
          data: values,
          type: "line" as const,
          smooth: true,
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "hsla(180, 70%, 45%, 0.3)" },
                { offset: 1, color: "hsla(180, 70%, 45%, 0.02)" },
              ],
            },
          },
          lineStyle: { color: "hsl(180, 70%, 45%)", width: 2 },
          itemStyle: { color: "hsl(180, 70%, 45%)" },
          symbol: "none",
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { type: "dashed" as const, color: "#9ca3af", width: 1 },
            data: [{ yAxis: +(target * 100).toFixed(2), label: { show: true, formatter: "Target", position: "insideEndTop" as const, color: "#9ca3af", fontSize: 10 } }],
          },
        },
      ],
    };
  }, [filteredTimeline, target]);

  return (
    <div className="space-y-4">
      {/* Horizontal Band */}
      <div className="space-y-3">
        <div className="relative h-8">
          <div className="absolute inset-y-1 left-0 right-0 rounded bg-muted" />
          <div
            className="absolute inset-y-1 left-0 rounded"
            style={{
              width: `${targetPercent}%`,
              background: "hsla(180, 70%, 45%, 0.15)",
            }}
          />
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
          <div
            className="absolute top-0 bottom-0 w-px border-l border-dashed border-muted-foreground/40"
            style={{ left: `${targetPercent}%` }}
          />
        </div>
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

      {/* Timeline Chart */}
      {timeline && timeline.length > 0 && (
        <div className="space-y-3">
          <ReactEChartsCore option={chartOption} style={{ height: 180 }} />

          {/* Slider + Date Labels */}
          <div className="space-y-2">
            <Slider
              value={range}
              onValueChange={setRange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{startLabel}</span>
              <span>{endLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
