import ReactECharts from "echarts-for-react";

interface CashflowProjectionProps {
  monthlyIncome: number;
  monthlyExpenses: number;
}

export const CashflowProjection = ({ monthlyIncome, monthlyExpenses }: CashflowProjectionProps) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Generate projections for 12 months
  const incomeData = months.map((_, i) => {
    // Assume 3% annual income growth
    const growthFactor = 1 + (0.03 / 12) * i;
    return Math.round(monthlyIncome * growthFactor);
  });

  const expenseData = months.map((_, i) => {
    // Assume 5% annual expense inflation
    const inflationFactor = 1 + (0.05 / 12) * i;
    return Math.round(monthlyExpenses * inflationFactor);
  });

  const surplusData = months.map((_, i) => incomeData[i] - expenseData[i]);

  // Calculate cumulative savings
  let cumulative = 0;
  const cumulativeData = surplusData.map(surplus => {
    cumulative += surplus;
    return cumulative;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params: Array<{ seriesName: string; value: number; marker: string; axisValue?: string }>) => {
        let result = `<strong>${params[0]?.axisValue || ""}</strong><br/>`;
        params.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["Income", "Expenses", "Surplus", "Cumulative Savings"],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: months,
    },
    yAxis: [
      {
        type: "value",
        name: "Monthly (R)",
        position: "left",
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value.toString();
          },
        },
      },
      {
        type: "value",
        name: "Cumulative (R)",
        position: "right",
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value.toString();
          },
        },
      },
    ],
    series: [
      {
        name: "Income",
        type: "bar",
        data: incomeData,
        itemStyle: { color: "hsl(180, 70%, 45%)" },
      },
      {
        name: "Expenses",
        type: "bar",
        data: expenseData,
        itemStyle: { color: "hsl(0, 70%, 50%)" },
      },
      {
        name: "Surplus",
        type: "line",
        data: surplusData,
        lineStyle: { color: "hsl(120, 70%, 40%)" },
        itemStyle: { color: "hsl(120, 70%, 40%)" },
      },
      {
        name: "Cumulative Savings",
        type: "line",
        yAxisIndex: 1,
        data: cumulativeData,
        lineStyle: { color: "hsl(270, 70%, 50%)", type: "dashed" },
        itemStyle: { color: "hsl(270, 70%, 50%)" },
        areaStyle: { color: "hsla(270, 70%, 50%, 0.1)" },
      },
    ],
  };

  const annualIncome = incomeData.reduce((a, b) => a + b, 0);
  const annualExpenses = expenseData.reduce((a, b) => a + b, 0);
  const annualSurplus = annualIncome - annualExpenses;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg text-center">
        <div>
          <p className="text-sm text-muted-foreground">Projected Annual Income</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(annualIncome)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Projected Annual Expenses</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(annualExpenses)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Projected Annual Surplus</p>
          <p className={`text-lg font-bold ${annualSurplus >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(annualSurplus)}
          </p>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: "350px" }} />

      <p className="text-xs text-muted-foreground text-center">
        * Projections based on 3% annual income growth and 5% annual expense inflation
      </p>
    </div>
  );
};
