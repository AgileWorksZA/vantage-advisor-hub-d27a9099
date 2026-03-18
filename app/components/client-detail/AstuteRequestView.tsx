import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2, ChevronDown, ChevronRight, Plus, Info, AlertTriangle, Circle,
} from "lucide-react";

interface AstuteRequestViewProps {
  onClose: () => void;
}

// Demo data
const riskProviders = [
  {
    name: "ABSA Life",
    dataReceived: "2024/07/18",
    requestId: "REQ-2024-001",
    hasError: false,
    plans: [
      { planName: "Life Cover Plan", policyNumber: "ABL-001234", paymentAmount: "R 1,250.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
      { planName: "Disability Income", policyNumber: "ABL-001235", paymentAmount: "R 450.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "Sanlam",
    dataReceived: "2024/07/18",
    requestId: "REQ-2024-002",
    hasError: false,
    plans: [
      { planName: "Glacier Endowment", policyNumber: "SAN-998877", paymentAmount: "R 2,500.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
      { planName: "Cumulus Echo", policyNumber: "SAN-998878", paymentAmount: "R 800.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: false },
    ],
  },
  {
    name: "Old Mutual",
    dataReceived: "2024/07/17",
    requestId: "REQ-2024-003",
    hasError: false,
    plans: [
      { planName: "Greenlight Life Plan", policyNumber: "OM-556677", paymentAmount: "R 1,800.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "Liberty",
    dataReceived: "2024/07/17",
    requestId: "REQ-2024-004",
    hasError: false,
    plans: [
      { planName: "Lifestyle Protector", policyNumber: "LIB-334455", paymentAmount: "R 950.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
      { planName: "Evolve", policyNumber: "LIB-334456", paymentAmount: "R 1,100.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: false },
    ],
  },
  {
    name: "Momentum",
    dataReceived: "2024/07/16",
    requestId: "REQ-2024-005",
    hasError: false,
    plans: [
      { planName: "Myriad", policyNumber: "MOM-112233", paymentAmount: "R 3,200.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "Assupol",
    dataReceived: "2024/07/15",
    requestId: "REQ-2024-006",
    hasError: false,
    plans: [
      { planName: "Funeral Plan", policyNumber: "ASP-778899", paymentAmount: "R 150.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "FNB Life",
    dataReceived: "2024/07/15",
    requestId: "REQ-2024-007",
    hasError: false,
    plans: [
      { planName: "Smart Life Plan", policyNumber: "FNB-445566", paymentAmount: "R 600.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "Hollard",
    dataReceived: "2024/07/14",
    requestId: "REQ-2024-008",
    hasError: false,
    plans: [
      { planName: "Life Essential", policyNumber: "HOL-223344", paymentAmount: "R 380.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "BrightRock",
    dataReceived: "2024/07/14",
    requestId: "REQ-2024-009",
    hasError: false,
    plans: [
      { planName: "Get-Up Income", policyNumber: "BRK-667788", paymentAmount: "R 1,450.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "1Life",
    dataReceived: "2024/07/13",
    requestId: "REQ-2024-010",
    hasError: false,
    plans: [
      { planName: "Vantage Life Cover", policyNumber: "1LF-889900", paymentAmount: "R 275.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "PPS",
    dataReceived: "2024/07/12",
    requestId: "REQ-2024-011",
    hasError: false,
    plans: [
      { planName: "Professional Life Cover", policyNumber: "PPS-556677", paymentAmount: "R 2,100.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
  {
    name: "Clientele Life",
    dataReceived: "",
    requestId: "REQ-2024-012",
    hasError: true,
    errorMessage: "Data request failed - Provider timeout. Please retry.",
    plans: [],
  },
  {
    name: "Sanlam Namibia",
    dataReceived: "2024/07/11",
    requestId: "REQ-2024-013",
    hasError: false,
    plans: [
      { planName: "Namibia Life Plan", policyNumber: "SNM-334455", paymentAmount: "N$ 1,900.00", paymentDueDate: "2024/08/01", paidToDate: "2024/07/01", terminationDate: "-", imported: true },
    ],
  },
];

const medicalAidData = {
  schemeName: "Discovery Health",
  planName: "Executive Plan",
  membershipNumber: "DH-9012345",
  indicativePremium: "R 8,450.00",
  dateReceived: "2024/07/18",
  policyActive: "Yes",
  imported: true,
  members: [
    { type: "Principal Member", idNumber: "7905245013088", initials: "J", fullName: "Johannes", surname: "Van Der Berg", dob: "1979/05/24", effectiveFrom: "2020/01/01", contribution: "R 4,225.00" },
    { type: "Adult Dependant", idNumber: "8201150098087", initials: "A", fullName: "Anna", surname: "Van Der Berg", dob: "1982/01/15", effectiveFrom: "2020/01/01", contribution: "R 2,112.50" },
    { type: "Child Dependant", idNumber: "1205120045082", initials: "P", fullName: "Pieter", surname: "Van Der Berg", dob: "2012/05/12", effectiveFrom: "2020/01/01", contribution: "R 1,056.25" },
    { type: "Child Dependant", idNumber: "1508200067083", initials: "M", fullName: "Maria", surname: "Van Der Berg", dob: "2015/08/20", effectiveFrom: "2020/01/01", contribution: "R 1,056.25" },
  ],
};

const AstuteRequestView = ({ onClose }: AstuteRequestViewProps) => {
  const [riskBenefitsOpen, setRiskBenefitsOpen] = useState(false);
  const [medicalAidOpen, setMedicalAidOpen] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [consentChecked, setConsentChecked] = useState(true);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [adviserConsentCompleted, setAdviserConsentCompleted] = useState(true);

  const toggleProvider = (name: string) => {
    setExpandedProviders(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const receivedCount = riskProviders.filter(p => !p.hasError).length;

  return (
    <div className="flex h-full min-h-[600px] overflow-auto">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-6 pb-0">
          <h2 className="text-xl font-bold text-foreground tracking-wide uppercase">ASTUTE</h2>
          <div className="h-1 w-full bg-[hsl(180,70%,45%)] mt-2 mb-4" />

          {/* Progress Steps */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <StepBadge label="Adviser Consent" status="Accepted" />
            <StepBadge label="Client Consent" status="Complete" />
            <StepBadge label="Astute Data Request" status="Complete" />
            <StepBadge label="Risk Benefits" status="Received" />
            <StepBadge label="Medical Aid" status="Received" />
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Section 1: Adviser Consent */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(180,70%,45%)] text-white text-sm font-bold">1</span>
              <h3 className="text-base font-semibold text-foreground">Adviser Consent</h3>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Completed</Badge>
            </div>
            <div className="ml-10 space-y-2">
              <button className="text-sm text-[hsl(180,70%,45%)] hover:underline" onClick={() => setShowConsentDialog(true)}>View and accept digital consent</button>
              {adviserConsentCompleted && (
                <p className="text-sm text-muted-foreground">Accepted on: <span className="text-foreground">2024/06/15 09:30</span></p>
              )}
            </div>
          </div>

          {/* Digital Consent Declaration Dialog */}
          <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Astute Digital Consent Declaration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  I, the undersigned, hereby declare that I am an authorised user of the Astute system and that I have been duly authorised by my Financial Services Provider (FSP) to access and utilise the Astute platform for the purposes of obtaining client financial data.
                </p>
                <p>
                  I warrant that all information submitted through the Astute system is true, accurate, and complete to the best of my knowledge. I understand that any misrepresentation of information may result in the suspension or termination of my access to the Astute system.
                </p>
                <p>
                  I acknowledge that the data obtained through the Astute system is for the sole purpose of rendering financial advice and services to clients as contemplated in the Long-Term Insurance Act, the Short-Term Insurance Act, and the Financial Advisory and Intermediary Services Act (FAIS Act).
                </p>
                <p>
                  I hereby indemnify and hold harmless Astute Financial Services (Pty) Ltd, its directors, employees, and agents against any and all claims, losses, damages, liabilities, and expenses arising from or in connection with my use of the Astute system, including but not limited to any unauthorised access or misuse of client data.
                </p>
                <p>
                  I further authorise the Financial Sector Conduct Authority (FSCA) to verify my credentials and registration status as a financial services provider or representative, and I consent to such verification being conducted through the Astute system.
                </p>
              </div>
              {!adviserConsentCompleted && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowConsentDialog(false)}>Cancel</Button>
                  <Button onClick={() => { setAdviserConsentCompleted(true); setShowConsentDialog(false); }}>Accept</Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          {/* Section 2: Client Consent */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(180,70%,45%)] text-white text-sm font-bold">2</span>
              <h3 className="text-base font-semibold text-foreground">Client Consent</h3>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Completed</Badge>
            </div>
            <div className="ml-10 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Identification</label>
                  <Input value="7905245013088" readOnly className="bg-muted/50 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Cell number</label>
                  <Input value="+27 82 555 1234" readOnly className="bg-muted/50 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">E-mail</label>
                  <Input value="johannes@email.co.za" readOnly className="bg-muted/50 text-sm" />
                </div>
              </div>
              <button className="text-xs text-[hsl(180,70%,45%)] hover:underline">Update client details</button>

              <div className="flex items-start gap-2">
                <Checkbox
                  checked={consentChecked}
                  onCheckedChange={(v) => setConsentChecked(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">I agree the above details are correct and I have read the disclaimer</span>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10">
                  Request consent
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 rounded px-3 py-2">
                  <Info className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>An SMS will be sent to the client to obtain consent</span>
                </div>
              </div>

              <Button size="sm" className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white">
                Update Astute
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Consent received</label>
                  <Input value="2024/06/15" readOnly className="bg-muted/50 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Valid until</label>
                  <Input value="2025/06/15" readOnly className="bg-muted/50 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Astute Data Request */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(180,70%,45%)] text-white text-sm font-bold">3</span>
              <h3 className="text-base font-semibold text-foreground">Astute Data Request</h3>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Complete</Badge>
            </div>
            <div className="ml-10 space-y-3">

              {/* Risk Benefits */}
              <Collapsible open={riskBenefitsOpen} onOpenChange={setRiskBenefitsOpen}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                      <div className="flex items-center gap-2">
                        {riskBenefitsOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm font-medium text-foreground">Risk Benefits</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10"
                          onClick={(e) => e.stopPropagation()}>
                          Import all
                        </Button>
                        <span className="text-xs text-muted-foreground">Received {receivedCount}/{riskProviders.length}</span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 py-3 space-y-3">
                      <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 rounded px-3 py-2">
                        <Info className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-amber-700 dark:text-amber-400">Importing data will replace existing risk benefit data for this client.</span>
                      </div>

                      {riskProviders.map((provider) => (
                        <Collapsible key={provider.name} open={expandedProviders.has(provider.name)} onOpenChange={() => toggleProvider(provider.name)}>
                          <div className="border rounded">
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/30">
                                <div className="flex items-center gap-2">
                                  {expandedProviders.has(provider.name) ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                  <span className="text-sm text-[hsl(180,70%,45%)] font-medium">{provider.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {provider.hasError ? (
                                    <div className="flex items-center gap-1.5 text-amber-600">
                                      <AlertTriangle className="h-3.5 w-3.5" />
                                      <span>Error</span>
                                    </div>
                                  ) : (
                                    <>
                                      <span>Data Received: {provider.dataReceived}</span>
                                      <span>Latest Request ID: {provider.requestId}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="border-t">
                                {provider.hasError ? (
                                  <div className="px-3 py-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm text-amber-700 dark:text-amber-400">{provider.errorMessage}</span>
                                  </div>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/30">
                                        <TableHead className="text-xs">Plan name</TableHead>
                                        <TableHead className="text-xs">Policy number</TableHead>
                                        <TableHead className="text-xs text-right">Payment amount</TableHead>
                                        <TableHead className="text-xs">Payment due date</TableHead>
                                        <TableHead className="text-xs">Paid to date</TableHead>
                                        <TableHead className="text-xs">Termination date</TableHead>
                                        <TableHead className="text-xs w-[140px]"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {provider.plans.map((plan, i) => (
                                        <TableRow key={i} className="border-b border-border/50">
                                          <TableCell className="text-sm">{plan.planName}</TableCell>
                                          <TableCell className="text-sm">{plan.policyNumber}</TableCell>
                                          <TableCell className="text-sm text-right">{plan.paymentAmount}</TableCell>
                                          <TableCell className="text-sm">{plan.paymentDueDate}</TableCell>
                                          <TableCell className="text-sm">{plan.paidToDate}</TableCell>
                                          <TableCell className="text-sm">{plan.terminationDate}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <Button variant="ghost" size="sm" className="h-7 text-xs text-[hsl(180,70%,45%)]">View</Button>
                                              {plan.imported ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Imported</Badge>
                                              ) : (
                                                <Button variant="outline" size="sm" className="h-7 text-xs border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)]">Import</Button>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Medical Aid */}
              <Collapsible open={medicalAidOpen} onOpenChange={setMedicalAidOpen}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                      <div className="flex items-center gap-2">
                        {medicalAidOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm font-medium text-foreground">Medical Aid</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10"
                          onClick={(e) => e.stopPropagation()}>
                          Import all
                        </Button>
                        <span className="text-xs text-muted-foreground">Received 1/1</span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 py-3 space-y-4">
                      {/* Scheme Details */}
                      <div className="border rounded">
                        <div className="px-3 py-2.5 flex items-center justify-between">
                          <span className="text-sm text-[hsl(180,70%,45%)] font-medium">{medicalAidData.schemeName}</span>
                          <div className="flex items-center gap-2">
                            {medicalAidData.imported ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Imported</Badge>
                            ) : (
                              <Button variant="outline" size="sm" className="h-7 text-xs border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)]">Import</Button>
                            )}
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-xs">Medical scheme name</TableHead>
                              <TableHead className="text-xs">Plan name</TableHead>
                              <TableHead className="text-xs">Membership number</TableHead>
                              <TableHead className="text-xs">Indicative premium</TableHead>
                              <TableHead className="text-xs">Date data received</TableHead>
                              <TableHead className="text-xs">Policy active</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-sm">{medicalAidData.schemeName}</TableCell>
                              <TableCell className="text-sm">{medicalAidData.planName}</TableCell>
                              <TableCell className="text-sm">{medicalAidData.membershipNumber}</TableCell>
                              <TableCell className="text-sm">{medicalAidData.indicativePremium}</TableCell>
                              <TableCell className="text-sm">{medicalAidData.dateReceived}</TableCell>
                              <TableCell className="text-sm">{medicalAidData.policyActive}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Medical Aid Members */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Medical Aid Members</h4>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-xs">Member type description</TableHead>
                              <TableHead className="text-xs">Identification number</TableHead>
                              <TableHead className="text-xs">Initials</TableHead>
                              <TableHead className="text-xs">Full name</TableHead>
                              <TableHead className="text-xs">Surname</TableHead>
                              <TableHead className="text-xs">Date of birth</TableHead>
                              <TableHead className="text-xs">Member effective from</TableHead>
                              <TableHead className="text-xs">Contribution</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {medicalAidData.members.map((member, i) => (
                              <TableRow key={i} className="border-b border-border/50">
                                <TableCell className="text-sm">{member.type}</TableCell>
                                <TableCell className="text-sm">{member.idNumber}</TableCell>
                                <TableCell className="text-sm">{member.initials}</TableCell>
                                <TableCell className="text-sm">{member.fullName}</TableCell>
                                <TableCell className="text-sm">{member.surname}</TableCell>
                                <TableCell className="text-sm">{member.dob}</TableCell>
                                <TableCell className="text-sm">{member.effectiveFrom}</TableCell>
                                <TableCell className="text-sm">{member.contribution}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Sticky Panel */}
      <div className="w-64 self-start sticky top-4 m-4 rounded-lg border shadow-sm bg-background">
        <div className="p-4 border-b">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">ASTUTE</h3>
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Complete</Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[hsl(180,70%,45%)]">Astute request</h4>
          <div className="ml-2 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-foreground">Adviser consent</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-foreground">Client consent</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-foreground">Astute data request</span>
            </div>
            <div className="ml-6 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-muted-foreground">Risk benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-muted-foreground">Medical aid</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10"
              onClick={onClose}
            >
              Back
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
              onClick={onClose}
            >
              Save and Exit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step badge component
const StepBadge = ({ label, status }: { label: string; status: string }) => {
  const statusColor = {
    Accepted: "bg-green-100 text-green-700 border-green-200",
    Complete: "bg-green-100 text-green-700 border-green-200",
    Received: "bg-blue-100 text-blue-700 border-blue-200",
  }[status] || "bg-muted text-muted-foreground";

  return (
    <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5">
      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Badge className={`${statusColor} text-[10px] px-1.5 py-0`}>{status}</Badge>
    </div>
  );
};

export default AstuteRequestView;
