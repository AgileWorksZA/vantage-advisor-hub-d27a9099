import { useState } from "react";
import { DollarSign, TrendingUp, AlertTriangle, Upload } from "lucide-react";
import { NudgeCard } from "./NudgeCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Simple sparkline component
const Sparkline = () => (
  <svg width="80" height="24" className="text-[hsl(142,76%,36%)]">
    <path
      d="M0,20 L10,18 L20,15 L30,16 L40,12 L50,10 L60,8 L70,6 L80,4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const commissionData = [
  {
    id: 1,
    provider: "Ninety One",
    policyRef: "POL-2024-001",
    expected: "R 12,450",
    received: "R 12,450",
    variance: 0,
    status: "Matched",
  },
  {
    id: 2,
    provider: "Old Mutual",
    policyRef: "POL-2024-015",
    expected: "R 8,200",
    received: "R 7,650",
    variance: -6.7,
    status: "Disputed",
  },
  {
    id: 3,
    provider: "Allan Gray",
    policyRef: "POL-2024-023",
    expected: "R 5,600",
    received: "R 0",
    variance: -100,
    status: "Pending",
  },
  {
    id: 4,
    provider: "Sanlam",
    policyRef: "POL-2024-031",
    expected: "R 3,200",
    received: "R 3,200",
    variance: 0,
    status: "Matched",
  },
  {
    id: 5,
    provider: "Discovery",
    policyRef: "POL-2024-042",
    expected: "R 6,800",
    received: "R 7,480",
    variance: 10,
    status: "Excessive",
  },
];

export const CommissionNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<
    (typeof commissionData)[0] | null
  >(null);
  const [discrepancyNote, setDiscrepancyNote] = useState("");

  const issueCount = commissionData.filter((c) => c.status !== "Matched").length;
  const pendingAmount = "R 5,600";

  const getStatusBadge = (status: string, variance: number) => {
    switch (status) {
      case "Matched":
        return (
          <Badge className="bg-[hsl(142,76%,36%)]/20 text-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,36%)]/30">
            Matched
          </Badge>
        );
      case "Disputed":
        return (
          <Badge className="bg-[hsl(45,93%,47%)]/20 text-[hsl(45,93%,47%)] hover:bg-[hsl(45,93%,47%)]/30">
            Disputed
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">
            Pending
          </Badge>
        );
      case "Excessive":
        return (
          <Badge className="bg-[hsl(210,70%,40%)]/20 text-[hsl(210,70%,40%)] hover:bg-[hsl(210,70%,40%)]/30">
            Excessive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReconcile = (commission: (typeof commissionData)[0]) => {
    setSelectedCommission(commission);
    setDiscrepancyNote("");
    setReconcileOpen(true);
  };

  const handleSubmitReconciliation = () => {
    toast.success(
      `Reconciliation submitted for ${selectedCommission?.provider}`
    );
    setReconcileOpen(false);
    setSelectedCommission(null);
  };

  return (
    <>
      <NudgeCard
        title="Commission Issues"
        icon={<DollarSign className="w-4 h-4 text-[hsl(45,93%,47%)]" />}
        reasoning={`${issueCount} commission discrepancies detected. ${pendingAmount} in pending commissions may require follow-up with providers.`}
        actionLabel="Review Commissions"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(45,93%,47%)"
        badge={`${issueCount} issues`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Monthly Revenue Trend
            </span>
            <Sparkline />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-semibold text-[hsl(45,93%,47%)]">
              {pendingAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Disputed</span>
            <span className="font-medium">R 550</span>
          </div>
        </div>
      </NudgeCard>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-4">
              Commission Reconciliation
              <Sparkline />
            </SheetTitle>
            <SheetDescription>
              Review and reconcile commission payments from providers
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Policy Ref</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">
                      {commission.provider}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {commission.policyRef}
                    </TableCell>
                    <TableCell className="text-right">
                      {commission.expected}
                    </TableCell>
                    <TableCell className="text-right">
                      {commission.received}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        commission.variance < -5
                          ? "text-[hsl(45,93%,47%)]"
                          : commission.variance > 5
                          ? "text-[hsl(210,70%,40%)]"
                          : ""
                      }`}
                    >
                      {commission.variance !== 0 && (
                        <>
                          {commission.variance > 0 ? "+" : ""}
                          {commission.variance}%
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(commission.status, commission.variance)}
                    </TableCell>
                    <TableCell>
                      {commission.status !== "Matched" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReconcile(commission)}
                        >
                          Reconcile
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={reconcileOpen} onOpenChange={setReconcileOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Reconcile Commission</SheetTitle>
            <SheetDescription>
              {selectedCommission?.provider} - {selectedCommission?.policyRef}
            </SheetDescription>
          </SheetHeader>

          {selectedCommission && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected</span>
                  <span className="font-medium">
                    {selectedCommission.expected}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Received</span>
                  <span className="font-medium">
                    {selectedCommission.received}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Variance</span>
                  <span
                    className={`font-semibold ${
                      selectedCommission.variance < 0
                        ? "text-destructive"
                        : "text-[hsl(210,70%,40%)]"
                    }`}
                  >
                    {selectedCommission.variance}%
                  </span>
                </div>
              </div>

              <div>
                <Button variant="outline" className="w-full mb-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Provider Statement
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Discrepancy Notes</label>
                <Textarea
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  placeholder="Describe the discrepancy..."
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReconcileOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSubmitReconciliation}>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Flag Discrepancy
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
