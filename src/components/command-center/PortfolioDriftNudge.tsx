import { useState } from "react";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toast } from "sonner";

const driftClients = [
  {
    id: 1,
    clientName: "Andre Botha",
    currentRisk: 72,
    targetRisk: 60,
    drift: 12,
    currentFund: "Allan Gray Balanced",
    proposedFund: "Coronation Balanced Plus",
    legacyFee: "1.45%",
    tampFee: "0.85%",
    performance12m: "+8.2%",
    taxImpact: "R 2,340",
  },
  {
    id: 2,
    clientName: "Linda Ferreira",
    currentRisk: 45,
    targetRisk: 55,
    drift: -10,
    currentFund: "Old Mutual Multi-Manager",
    proposedFund: "PSG Balanced",
    legacyFee: "1.65%",
    tampFee: "0.90%",
    performance12m: "+6.8%",
    taxImpact: "R 1,890",
  },
  {
    id: 3,
    clientName: "Michael Naidoo",
    currentRisk: 68,
    targetRisk: 50,
    drift: 18,
    currentFund: "Ninety One Equity",
    proposedFund: "Sanlam Moderate Fund",
    legacyFee: "1.55%",
    tampFee: "0.75%",
    performance12m: "+12.4%",
    taxImpact: "R 4,560",
  },
  {
    id: 4,
    clientName: "Sarah Joubert",
    currentRisk: 38,
    targetRisk: 45,
    drift: -7,
    currentFund: "Discovery Moderate",
    proposedFund: "Momentum Flexible",
    legacyFee: "1.35%",
    tampFee: "0.80%",
    performance12m: "+5.1%",
    taxImpact: "R 980",
  },
];

export const PortfolioDriftNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [migrationStep, setMigrationStep] = useState(0);

  const toggleClient = (id: number) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleGlobalMigrate = () => {
    if (selectedClients.length === 0) {
      toast.error("Please select at least one client");
      return;
    }
    setMigrationStep(1);
  };

  const handleConfirmMigration = () => {
    toast.success(
      `Migration initiated for ${selectedClients.length} client(s)`
    );
    setMigrationStep(0);
    setSelectedClients([]);
    setSheetOpen(false);
  };

  const RiskDial = ({
    current,
    target,
  }: {
    current: number;
    target: number;
  }) => {
    const drift = current - target;
    const color =
      Math.abs(drift) > 10
        ? "hsl(0,84%,60%)"
        : Math.abs(drift) > 5
        ? "hsl(45,93%,47%)"
        : "hsl(142,76%,36%)";

    return (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke={color}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${(current / 100) * 100} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {current}
          </span>
        </div>
        <div className="text-xs">
          <div className="text-muted-foreground">Target: {target}</div>
          <div className="font-medium" style={{ color }}>
            {drift > 0 ? "+" : ""}
            {drift}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <NudgeCard
        title="Portfolio Drift Alert"
        icon={<Activity className="w-4 h-4 text-[hsl(45,93%,47%)]" />}
        reasoning="4 clients have portfolios that have drifted more than 5% from their target Stratifi risk scores. Rebalancing now maintains proper risk alignment."
        actionLabel="Align to House View"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(45,93%,47%)"
        badge="4 portfolios"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Avg Drift</span>
            <span className="font-semibold text-[hsl(45,93%,47%)]">11.75%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Clients Affected</span>
            <span className="font-medium">4</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Fee Savings</span>
            <span className="font-semibold text-[hsl(142,76%,36%)]">
              R 28,450/yr
            </span>
          </div>
        </div>
      </NudgeCard>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>TAMP Migration Center</SheetTitle>
            <SheetDescription>
              Clients with portfolio drift from Stratifi risk targets
            </SheetDescription>
          </SheetHeader>

          {migrationStep === 0 ? (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">
                  {selectedClients.length} selected
                </span>
                <Button
                  size="sm"
                  onClick={handleGlobalMigrate}
                  disabled={selectedClients.length === 0}
                >
                  Global Migrate
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Proposed Fund</TableHead>
                    <TableHead className="text-right">Tax Impact</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driftClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={() => toggleClient(client.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{client.clientName}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.currentFund}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RiskDial
                          current={client.currentRisk}
                          target={client.targetRisk}
                        />
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-sm"
                            >
                              {client.proposedFund}
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64">
                            <div className="space-y-2 text-sm">
                              <h4 className="font-semibold">Fee Comparison</h4>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Legacy Fee
                                </span>
                                <span className="text-destructive">
                                  {client.legacyFee}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  TAMP Fee
                                </span>
                                <span className="text-[hsl(142,76%,36%)]">
                                  {client.tampFee}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="text-muted-foreground">
                                  12M Performance
                                </span>
                                <span className="font-medium text-[hsl(142,76%,36%)]">
                                  {client.performance12m}
                                </span>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {client.taxImpact}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClients([client.id]);
                            setMigrationStep(1);
                          }}
                        >
                          Migrate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Migration Wizard */}
              <div className="flex items-center gap-4 mb-8">
                {["Tax Analysis", "Consent", "Execute"].map((step, idx) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        migrationStep > idx
                          ? "bg-[hsl(142,76%,36%)] text-white"
                          : migrationStep === idx + 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                    {idx < 2 && (
                      <div className="w-8 h-0.5 bg-muted mx-2" />
                    )}
                  </div>
                ))}
              </div>

              {migrationStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Tax Impact Analysis</h3>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Selected Clients</span>
                      <span className="font-medium">
                        {selectedClients.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total CGT Exposure</span>
                      <span className="font-medium text-[hsl(45,93%,47%)]">
                        R 9,770
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TLH Offset Available</span>
                      <span className="font-medium text-[hsl(142,76%,36%)]">
                        R 5,230
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="font-medium">Net Tax Impact</span>
                      <span className="font-semibold">R 4,540</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setMigrationStep(2)}
                  >
                    Continue to Consent
                  </Button>
                </div>
              )}

              {migrationStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Digital Consent Status</h3>
                  <div className="space-y-3">
                    {selectedClients.map((id) => {
                      const client = driftClients.find((c) => c.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span>{client?.clientName}</span>
                          <span className="text-sm text-[hsl(142,76%,36%)] flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            Consent Signed
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setMigrationStep(3)}
                  >
                    Continue to Execute
                  </Button>
                </div>
              )}

              {migrationStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">STP Trade Instructions</h3>
                  <div className="p-4 bg-[hsl(142,76%,36%)]/10 rounded-lg border border-[hsl(142,76%,36%)]/20">
                    <p className="text-sm">
                      Ready to execute trades for {selectedClients.length}{" "}
                      client(s). This will:
                    </p>
                    <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                      <li>Submit sell orders for legacy funds</li>
                      <li>Submit buy orders for TAMP model funds</li>
                      <li>Update client portfolios automatically</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setMigrationStep(0)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
                      onClick={handleConfirmMigration}
                    >
                      Execute Migration
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
