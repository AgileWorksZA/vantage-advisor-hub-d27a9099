import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { generateClient360Data, mapNationalityToJurisdiction } from "@/data/regional360ViewData";
import type { PrepProduct, PrepOpportunity } from "@/hooks/useClientMeetingPrep";
import { CheckCircle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Client, getDisplayName } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Users, Loader2 } from "lucide-react";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import { useHouseholdMeetingPrep } from "@/hooks/useHouseholdMeetingPrep";
import OpportunitiesTab, { getOpportunitiesCount, buildGapOpportunities } from "./next-best-action/OpportunitiesTab";
import OpportunitySummaryTiles, { getInProgressOpportunities, getCompletedOpportunities, type OpportunityStatus } from "./next-best-action/OpportunitySummaryTiles";
import OutstandingTab from "./next-best-action/OutstandingTab";
import RecentActivityTab, { RECENT_ACTIVITY_COUNT } from "./next-best-action/RecentActivityTab";
import { MeetingPrepSheet } from "./MeetingPrepSheet";
import { ClientCalendarEvent } from "@/hooks/useClientCalendarEvents";
import { TLHDashboard } from "@/components/tax-loss-harvesting/TLHDashboard";

interface ClientSummaryTabProps {
  client: Client;
  clientId: string;
  onShowMoreActivity?: () => void;
  onTabChange?: (tab: string) => void;
}

const ClientSummaryTab = ({ client, clientId, onShowMoreActivity, onTabChange }: ClientSummaryTabProps) => {
  const displayName = getDisplayName(client);
  const prepData = useClientMeetingPrep(clientId);

  const [householdView, setHouseholdView] = useState(false);
  const householdData = useHouseholdMeetingPrep(client.household_group, householdView);

  const [meetingPrepOpen, setMeetingPrepOpen] = useState(false);
  const [selectedMeetingEvent, setSelectedMeetingEvent] = useState<ClientCalendarEvent | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [tlhDashboardOpen, setTlhDashboardOpen] = useState(false);
  const [scanOpportunities, setScanOpportunities] = useState<PrepOpportunity[]>([]);
  const [scanResultsOpen, setScanResultsOpen] = useState(false);
  const [latestScanResults, setLatestScanResults] = useState<PrepOpportunity[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OpportunityStatus>("identified");

  const scanTemplates: { type: string; reasoning: string; action: string; revenueRange: [number, number] }[] = useMemo(() => [
    { type: "Migration", reasoning: "Consolidate external holdings to reduce fees", action: "Migrate to preferred platform", revenueRange: [15000, 45000] },
    { type: "Upsell", reasoning: "Increase retirement contributions by 5%", action: "Top up retirement annuity", revenueRange: [20000, 80000] },
    { type: "Cross-sell", reasoning: "Add disability cover to protect income", action: "Quote disability insurance", revenueRange: [8000, 25000] },
    { type: "Platform", reasoning: "Switch to lower-fee share class", action: "Platform fee reduction", revenueRange: [5000, 20000] },
    { type: "New Business", reasoning: "Offshore investment diversification", action: "Open offshore unit trust", revenueRange: [30000, 100000] },
    { type: "Tax Loss", reasoning: "Harvest unrealised losses in equity portfolio", action: "Execute tax-loss harvest", revenueRange: [10000, 50000] },
    { type: "Upsell", reasoning: "Estate planning review overdue", action: "Schedule estate planning meeting", revenueRange: [12000, 35000] },
    { type: "Cross-sell", reasoning: "No life cover detected for dependants", action: "Quote life insurance", revenueRange: [15000, 40000] },
  ], []);

  const handleOptimise = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => {
      const usedReasonings = new Set(scanOpportunities.map(o => o.reasoning));
      const available = scanTemplates.filter(t => !usedReasonings.has(t.reasoning));
      const pool = available.length >= 2 ? available : scanTemplates;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const count = Math.random() > 0.5 ? 2 : 1;
      const newOpps: PrepOpportunity[] = shuffled.slice(0, count).map((t, i) => ({
        id: `scan-${Date.now()}-${i}`,
        clientName: `${client.first_name} ${client.surname.charAt(0)}.`,
        opportunityType: t.type,
        reasoning: t.reasoning,
        suggestedAction: t.action,
        potentialRevenue: Math.round(t.revenueRange[0] + Math.random() * (t.revenueRange[1] - t.revenueRange[0])),
        confidence: Math.round(65 + Math.random() * 30),
        status: "identified",
        dateIdentified: new Date().toISOString().split("T")[0],
      }));

      setScanOpportunities(prev => [...prev, ...newOpps]);
      setLatestScanResults(newOpps);
      setIsScanning(false);
      setHasScanned(true);
      setScanResultsOpen(true);
    }, 1500);
  }, [scanOpportunities, scanTemplates]);

  // Derive jurisdiction from client
  const clientJurisdiction = useMemo(() => {
    return mapNationalityToJurisdiction(client.nationality || client.country_of_issue || null);
  }, [client.nationality, client.country_of_issue]);

  // Generate 360 View products and convert to PrepProduct format
  const view360Products = useMemo(() => {
    const generateForClient = (id: string, nationality: string | null, countryOfIssue: string | null, clientName?: string) => {
      const data = generateClient360Data(id, nationality, countryOfIssue);
      const products: (PrepProduct & { provider?: string; clientName?: string })[] = [];

      data.onPlatformProducts.forEach((p, i) => {
        products.push({ id: `360-onplat-${id}-${i}`, productName: p.product, category: "Investment - On Platform", currentValue: p.amountValue, status: "active", provider: "Vantage", clientName });
      });
      data.externalProducts.forEach((p, i) => {
        products.push({ id: `360-ext-${id}-${i}`, productName: `${p.product} (${p.provider})`, category: "Investment - External", currentValue: p.amountValue, status: "active", provider: p.provider, clientName });
      });
      data.platformCashAccounts.forEach((p, i) => {
        products.push({ id: `360-cash-${id}-${i}`, productName: p.name, category: "Cash", currentValue: p.amountValue, status: "active", provider: "Platform", clientName });
      });
      data.riskProducts.forEach((p, i) => {
        products.push({ id: `360-risk-${id}-${i}`, productName: p.holdingName, category: "Risk / Insurance", currentValue: 0, status: "active", provider: p.holdingName, clientName });
      });
      data.shortTermProducts.forEach((p, i) => {
        products.push({ id: `360-st-${id}-${i}`, productName: `${p.policyType} - ${p.insurer}`, category: "Short-Term Insurance", currentValue: 0, status: "active", provider: p.insurer, clientName });
      });
      data.medicalAid.forEach((p, i) => {
        products.push({ id: `360-med-${id}-${i}`, productName: `${p.schemeName} ${p.planName}`, category: "Medical Aid", currentValue: 0, status: "active", provider: p.schemeName, clientName });
      });

      return products;
    };

    if (householdView && householdData.householdClients.length > 0) {
      const allProducts: (PrepProduct & { provider?: string; clientName?: string })[] = [];
      householdData.householdClients.forEach(member => {
        const memberName = `${member.firstName} ${member.surname.charAt(0)}.`;
        const memberProducts = generateForClient(member.id, member.nationality, member.countryOfIssue, memberName);
        allProducts.push(...memberProducts);
      });
      return allProducts;
    }

    return generateForClient(clientId, client.nationality, client.country_of_issue);
  }, [clientId, client.nationality, client.country_of_issue, householdView, householdData.householdClients]);

  const activeOpps = [...(householdView ? householdData.opportunities : prepData.opportunities), ...scanOpportunities];
  const baseProducts = householdView ? householdData.products : prepData.products;
  const activeProducts = [...baseProducts, ...view360Products];
  const activeTasks = householdView ? householdData.tasks : prepData.tasks;
  const activeDocs = householdView ? householdData.documents : prepData.documents;

  const gapOpportunities = useMemo(() => buildGapOpportunities(activeProducts, householdView, clientId), [activeProducts, householdView, clientId]);
  const oppsCount = getOpportunitiesCount(activeOpps, activeProducts, householdView);
  const outstandingCount = activeTasks.length + activeDocs.length;

  // Filtered lists for in-progress and completed views
  const inProgressOpps = useMemo(() => getInProgressOpportunities(activeOpps), [activeOpps]);
  const completedOpps = useMemo(() => getCompletedOpportunities(activeOpps), [activeOpps]);

  const currencyMap: Record<string, { code: string; locale: string }> = {
    ZA: { code: "ZAR", locale: "en-ZA" },
    AU: { code: "AUD", locale: "en-AU" },
    CA: { code: "CAD", locale: "en-CA" },
    GB: { code: "GBP", locale: "en-GB" },
    US: { code: "USD", locale: "en-US" },
  };
  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    const curr = currencyMap[clientJurisdiction || "ZA"] || currencyMap.ZA;
    return new Intl.NumberFormat(curr.locale, { style: "currency", currency: curr.code, maximumFractionDigits: 0 }).format(value);
  };

  const renderStatusList = (opps: PrepOpportunity[], statusLabel: string, statusColor: string, StatusIcon: typeof Clock) => (
    <div className="space-y-0">
      {opps.length === 0 ? (
        <div className="flex flex-col items-center py-4 gap-2">
          <p className="text-xs text-muted-foreground text-center">No {statusLabel.toLowerCase()} opportunities.</p>
        </div>
      ) : (
        opps.map(opp => (
          <div key={opp.id} className="flex gap-2 py-1.5 border-b border-border/50 last:border-0">
            <div className="shrink-0 mt-0.5 text-muted-foreground">
              <StatusIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className={`${statusColor} text-[10px] px-1.5 py-0 font-medium`}>{statusLabel}</Badge>
                <span className="text-xs font-semibold">{opp.opportunityType}</span>
                {opp.potentialRevenue && (
                  <span className="text-[10px] font-semibold text-emerald-600">{formatCurrency(opp.potentialRevenue)}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{opp.reasoning || opp.suggestedAction}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div>
      {/* Summary tiles above the card */}
      <OpportunitySummaryTiles
        opportunities={activeOpps}
        gapOpportunities={gapOpportunities}
        jurisdiction={clientJurisdiction}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <Card className="flex flex-col">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Opportunities</CardTitle>
              <div className="flex items-center gap-2">
                {client.household_group && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Household</span>
                    <Switch
                      checked={householdView}
                      onCheckedChange={setHouseholdView}
                      className="scale-75"
                    />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOptimise}
                  disabled={isScanning}
                  className="border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10"
                >
                  {isScanning ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full mr-1">AI</span>}
                  {isScanning ? "Scanning..." : "Optimize"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col">
            {selectedStatus === "identified" ? (
              <>
                <Tabs defaultValue="opportunities" className="w-full flex-1 flex flex-col">
                  <TabsList className="w-full h-8 mb-2">
                    <TabsTrigger value="opportunities" className="text-xs flex-1">
                      Opportunities ({oppsCount})
                    </TabsTrigger>
                    <TabsTrigger value="outstanding" className="text-xs flex-1">
                      Outstanding ({outstandingCount})
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="text-xs flex-1">
                      Recent Activity ({RECENT_ACTIVITY_COUNT})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="opportunities" className="mt-0 flex-1">
                    <OpportunitiesTab opportunities={activeOpps} products={activeProducts} householdView={householdView} onOptimise={handleOptimise} hasScanned={hasScanned} isScanning={isScanning} onTaxLossClick={() => setTlhDashboardOpen(true)} jurisdiction={clientJurisdiction} />
                  </TabsContent>
                  <TabsContent value="outstanding" className="mt-0 flex-1">
                    <OutstandingTab tasks={activeTasks} documents={activeDocs} householdView={householdView} />
                  </TabsContent>
                  <TabsContent value="recent" className="mt-0 flex-1">
                    <RecentActivityTab
                      householdView={householdView}
                      clientId={clientId}
                      onCalendarEventClick={(event) => {
                        setSelectedMeetingEvent(event);
                        setMeetingPrepOpen(true);
                      }}
                      onActivityClick={(type) => onTabChange?.(type)}
                    />
                  </TabsContent>
                </Tabs>
              </>
            ) : selectedStatus === "in-progress" ? (
              renderStatusList(inProgressOpps, "In Progress", "bg-amber-100 text-amber-700 border-amber-200", Clock)
            ) : (
              renderStatusList(completedOpps, "Completed", "bg-emerald-100 text-emerald-700 border-emerald-200", CheckCircle2)
            )}

            <div className="pt-1 border-t mt-1">
              <Button
                variant="link"
                className="p-0 h-auto text-[hsl(180,70%,45%)] hover:text-[hsl(180,70%,35%)]"
                onClick={onShowMoreActivity}
              >
                Show more
              </Button>
            </div>
          </CardContent>
      </Card>

      <MeetingPrepSheet
        open={meetingPrepOpen}
        onOpenChange={setMeetingPrepOpen}
        event={selectedMeetingEvent}
        clientId={clientId}
        onNavigate={(type) => {
          setMeetingPrepOpen(false);
          onTabChange?.(type === "note" ? "notes" : type === "communication" ? "communication" : type === "document" ? "documents" : type);
        }}
      />

      <TLHDashboard
        open={tlhDashboardOpen}
        onOpenChange={setTlhDashboardOpen}
        clientName={displayName}
        clientId={clientId}
      />

      <Dialog open={scanResultsOpen} onOpenChange={setScanResultsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              AI Scan Complete
            </DialogTitle>
            <DialogDescription>
              {latestScanResults.length} new {latestScanResults.length === 1 ? "opportunity" : "opportunities"} identified
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {latestScanResults.map(opp => (
              <div key={opp.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{opp.opportunityType}</span>
                    {opp.potentialRevenue && (
                      <span className="text-[10px] font-semibold text-emerald-600">
                        {formatCurrency(opp.potentialRevenue)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{opp.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="w-full mt-2">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSummaryTab;
