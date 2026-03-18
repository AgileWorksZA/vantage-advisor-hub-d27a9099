import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactECharts from "echarts-for-react";

interface BucketAllocationChartProps {
  clientId: string;
  workflowId: string;
  totalAssets: number;
  monthlySurplus: number;
  onDataChange: () => void;
}

interface BucketData {
  Income: { recommended: number; current: number; proposed: number; notes: string };
  Preservation: { recommended: number; current: number; proposed: number; notes: string };
  Wealth: { recommended: number; current: number; proposed: number; notes: string };
}

export const BucketAllocationChart = ({
  clientId,
  workflowId,
  totalAssets,
  monthlySurplus,
  onDataChange,
}: BucketAllocationChartProps) => {
  const [buckets, setBuckets] = useState<BucketData>({
    Income: { recommended: 0, current: 0, proposed: 0, notes: "" },
    Preservation: { recommended: 0, current: 0, proposed: 0, notes: "" },
    Wealth: { recommended: 0, current: 0, proposed: 0, notes: "" },
  });
  const [loading, setLoading] = useState(true);

  // Calculate recommended amounts based on financial position
  const calculateRecommendations = useCallback(() => {
    // Bucket 1: Income/Liquidity (1-3 years of expenses = 12-36 months of surplus)
    const incomeBucket = Math.abs(monthlySurplus) * 24; // 2 years of expenses/income
    
    // Bucket 2: Preservation (20-30% of total assets)
    const preservationBucket = totalAssets * 0.25;
    
    // Bucket 3: Wealth Creation (remaining assets)
    const wealthBucket = Math.max(0, totalAssets - incomeBucket - preservationBucket);

    return {
      Income: incomeBucket,
      Preservation: preservationBucket,
      Wealth: wealthBucket,
    };
  }, [totalAssets, monthlySurplus]);

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("bucket_allocations")
          .select("*")
          .eq("workflow_id", workflowId);

        if (error) throw error;

        const recommendations = calculateRecommendations();

        if (data && data.length > 0) {
          const bucketsMap: BucketData = {
            Income: { recommended: recommendations.Income, current: 0, proposed: 0, notes: "" },
            Preservation: { recommended: recommendations.Preservation, current: 0, proposed: 0, notes: "" },
            Wealth: { recommended: recommendations.Wealth, current: 0, proposed: 0, notes: "" },
          };

          data.forEach((b: { bucket_type: string; current_allocation: number; proposed_allocation: number; notes: string | null }) => {
            if (b.bucket_type in bucketsMap) {
              const key = b.bucket_type as keyof BucketData;
              bucketsMap[key] = {
                ...bucketsMap[key],
                current: b.current_allocation || 0,
                proposed: b.proposed_allocation || 0,
                notes: b.notes || "",
              };
            }
          });

          setBuckets(bucketsMap);
        } else {
          // Initialize with recommendations
          setBuckets({
            Income: { recommended: recommendations.Income, current: 0, proposed: recommendations.Income, notes: "" },
            Preservation: { recommended: recommendations.Preservation, current: 0, proposed: recommendations.Preservation, notes: "" },
            Wealth: { recommended: recommendations.Wealth, current: 0, proposed: recommendations.Wealth, notes: "" },
          });
        }
      } catch (err) {
        console.error("Error fetching buckets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuckets();
  }, [workflowId, calculateRecommendations]);

  const handleBucketChange = (bucket: keyof BucketData, field: "proposed" | "notes", value: number | string) => {
    setBuckets(prev => ({
      ...prev,
      [bucket]: { ...prev[bucket], [field]: value },
    }));
    onDataChange();
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete existing and insert new
      await supabase
        .from("bucket_allocations")
        .delete()
        .eq("workflow_id", workflowId);

      const inserts = Object.entries(buckets).map(([bucketType, data]) => ({
        user_id: user.id,
        workflow_id: workflowId,
        bucket_type: bucketType,
        recommended_amount: data.recommended,
        current_allocation: data.current,
        proposed_allocation: data.proposed,
        notes: data.notes || null,
      }));

      const { error } = await supabase
        .from("bucket_allocations")
        .insert(inserts);

      if (error) throw error;
      toast.success("Bucket allocations saved");
    } catch (err) {
      console.error("Error saving buckets:", err);
      toast.error("Failed to save bucket allocations");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartOption = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Proposed Allocation",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
        },
        data: [
          { value: buckets.Income.proposed, name: "Income (1-3 yrs)", itemStyle: { color: "hsl(180, 70%, 45%)" } },
          { value: buckets.Preservation.proposed, name: "Preservation (4-6 yrs)", itemStyle: { color: "hsl(220, 70%, 50%)" } },
          { value: buckets.Wealth.proposed, name: "Wealth (7+ yrs)", itemStyle: { color: "hsl(270, 70%, 50%)" } },
        ],
      },
    ],
  };

  const bucketInfo = [
    {
      key: "Income" as const,
      name: "Bucket 1: Income/Liquidity",
      description: "Short-term needs (1-3 years). Focus on capital preservation and easy access.",
      color: "hsl(180, 70%, 45%)",
    },
    {
      key: "Preservation" as const,
      name: "Bucket 2: Preservation",
      description: "Medium-term needs (4-6 years). Balance between growth and stability.",
      color: "hsl(220, 70%, 50%)",
    },
    {
      key: "Wealth" as const,
      name: "Bucket 3: Wealth Creation",
      description: "Long-term growth (7+ years). Focus on capital appreciation.",
      color: "hsl(270, 70%, 50%)",
    },
  ];

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart */}
        <div>
          <ReactECharts option={chartOption} style={{ height: "300px" }} />
        </div>

        {/* Summary */}
        <div className="space-y-3">
          {bucketInfo.map(info => (
            <Card key={info.key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                  <h4 className="font-medium text-sm">{info.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Recommended:</span>
                    <p className="font-medium">{formatCurrency(buckets[info.key].recommended)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <p className="font-medium">{formatCurrency(buckets[info.key].current)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Proposed:</span>
                    <p className="font-medium text-primary">{formatCurrency(buckets[info.key].proposed)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Input */}
      <div className="space-y-4">
        <h4 className="font-medium">Adjust Allocations</h4>
        {bucketInfo.map(info => (
          <div key={info.key} className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <Label>{info.name}</Label>
              <p className="text-xs text-muted-foreground mb-2">Recommended: {formatCurrency(buckets[info.key].recommended)}</p>
            </div>
            <div>
              <Label>Proposed Amount (R)</Label>
              <Input
                type="number"
                value={buckets[info.key].proposed}
                onChange={e => handleBucketChange(info.key, "proposed", Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Strategy Notes</Label>
              <Textarea
                value={buckets[info.key].notes}
                onChange={e => handleBucketChange(info.key, "notes", e.target.value)}
                placeholder="Investment strategy notes..."
                className="mt-1 h-10"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Allocations</Button>
      </div>
    </div>
  );
};
