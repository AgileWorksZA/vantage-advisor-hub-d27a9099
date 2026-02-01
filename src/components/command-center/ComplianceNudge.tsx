import { useState } from "react";
import { GraduationCap, Upload, ExternalLink } from "lucide-react";
import { NudgeCard } from "./NudgeCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const cpdCategories = [
  { name: "Ethics", required: 6, completed: 4, color: "hsl(0,84%,60%)" },
  { name: "Regulatory", required: 8, completed: 8, color: "hsl(142,76%,36%)" },
  { name: "Professional", required: 10, completed: 6, color: "hsl(45,93%,47%)" },
  { name: "Product Knowledge", required: 6, completed: 0, color: "hsl(210,70%,40%)" },
];

const totalRequired = 30;
const totalCompleted = 18;

export const ComplianceNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const daysUntilExpiry = 28;
  const isUrgent = daysUntilExpiry < 30 && totalCompleted < totalRequired;

  const handleUploadCertificate = () => {
    toast.success("Certificate upload initiated");
  };

  const handleBookCourse = () => {
    toast.success("Redirecting to training catalog...");
  };

  return (
    <>
      <NudgeCard
        title="CPD Compliance Alert"
        icon={<GraduationCap className="w-4 h-4 text-destructive" />}
        reasoning={`CPD cycle expires in ${daysUntilExpiry} days. You need ${
          totalRequired - totalCompleted
        } more hours to meet requirements. Non-compliance may result in license suspension.`}
        actionLabel="Complete Hours"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(0,84%,60%)"
        badge={`${daysUntilExpiry} days left`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cycle Progress</span>
            <span className="text-sm font-semibold">
              {totalCompleted}/{totalRequired} hrs
            </span>
          </div>
          <Progress
            value={(totalCompleted / totalRequired) * 100}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hours Needed: {totalRequired - totalCompleted}</span>
            <span className={isUrgent ? "text-destructive font-medium" : ""}>
              Expires: {daysUntilExpiry} days
            </span>
          </div>
        </div>
      </NudgeCard>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>CPD Compliance Tracker</SheetTitle>
            <SheetDescription>
              Cycle ends in {daysUntilExpiry} days
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Overall Progress Ring */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={isUrgent ? "hsl(0,84%,60%)" : "hsl(142,76%,36%)"}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(totalCompleted / totalRequired) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{totalCompleted}</span>
                  <span className="text-xs text-muted-foreground">
                    of {totalRequired} hrs
                  </span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium">Category Breakdown</h4>
              {cpdCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span
                      className={
                        category.completed >= category.required
                          ? "text-[hsl(142,76%,36%)]"
                          : "text-muted-foreground"
                      }
                    >
                      {category.completed}/{category.required} hrs
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (category.completed / category.required) * 100,
                          100
                        )}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleUploadCertificate}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Certificate
              </Button>
              <Button className="w-full" onClick={handleBookCourse}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Explore Courses
              </Button>
            </div>

            {isUrgent && (
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Urgent: Complete {totalRequired - totalCompleted} hours
                  within {daysUntilExpiry} days to maintain compliance.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
