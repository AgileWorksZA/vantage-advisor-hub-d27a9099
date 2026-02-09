import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";
import { useOnboardingProgress, TimeBucket } from "@/hooks/useOnboardingProgress";

interface OnboardingProgressWidgetProps {
  selectedAdvisorNames: string[];
}

const TIME_BUCKET_LABELS: { key: TimeBucket; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "lt7days", label: "< 7 days" },
  { key: "lt14days", label: "< 14 days" },
  { key: "lt1month", label: "< 1 month" },
  { key: "gte1month", label: "≥ 1 month" },
];

const STATUS_COLUMNS = [
  { key: "In Progress", label: "In progress" },
  { key: "Pending Client", label: "Pending client" },
  { key: "Not Started", label: "Pending approval" },
];

export function OnboardingProgressWidget({ selectedAdvisorNames }: OnboardingProgressWidgetProps) {
  const navigate = useNavigate();
  const { matrix, loading } = useOnboardingProgress(selectedAdvisorNames);

  const handleCountClick = (status: string, bucket: TimeBucket) => {
    navigate(`/tasks?view=detail&taskType=Onboarding&status=${encodeURIComponent(status)}&dueBucket=${bucket}`);
  };

  return (
    <Card className="h-full">
      <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          
          <CardTitle className="text-sm font-medium">Account onboarding progress</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs">
                <th className="text-left pb-2 font-normal">Time</th>
                 {STATUS_COLUMNS.map((col) => (
                   <th key={col.key} className="text-center pb-2 font-normal">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_BUCKET_LABELS.map((bucket) => (
                <tr key={bucket.key} className="border-t border-border">
                  <td className="py-1.5 text-muted-foreground">{bucket.label}</td>
                  {STATUS_COLUMNS.map((col) => {
                    const count = matrix[bucket.key]?.[col.key] || 0;
                    return (
                      <td key={col.key} className="py-1.5 text-center">
                        {count > 0 ? (
                          <button
                            onClick={() => handleCountClick(col.key, bucket.key)}
                            className="text-primary hover:text-primary/80 font-medium cursor-pointer"
                          >
                            {count}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
