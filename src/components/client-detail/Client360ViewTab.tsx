import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientDetail } from "@/hooks/useClientDetail";
import { generateClient360Data, formatTotal, mapNationalityToJurisdiction } from "@/data/regional360ViewData";
import QuoteWizardView from "./QuoteWizardDialog";
import NewBusinessWizardDialog from "./NewBusinessWizardDialog";
import AddMedicalAidForm from "./AddMedicalAidForm";
import AddRiskProductForm from "./AddRiskProductForm";
import AddShortTermForm from "./AddShortTermForm";
import AddWillForm from "./AddWillForm";
import AstuteRequestView from "./AstuteRequestView";

const Client360ViewTab = () => {
  const { clientId } = useParams<{ clientId: string }>();

  const scrollToTop = useCallback(() => {
    const scrollContainer = document.querySelector('main.overflow-auto') 
      || document.querySelector('main');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);
  const { client, loading } = useClientDetail(clientId || "");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showAllOnPlatform, setShowAllOnPlatform] = useState(false);
  const [showQuoteWizard, setShowQuoteWizard] = useState(false);
  const [showNewBusinessWizard, setShowNewBusinessWizard] = useState(false);
  const [showMedicalAidForm, setShowMedicalAidForm] = useState(false);
  const [showRiskProductForm, setShowRiskProductForm] = useState(false);
  const [showShortTermForm, setShowShortTermForm] = useState(false);
  const [showWillForm, setShowWillForm] = useState(false);
  const [showAstuteRequest, setShowAstuteRequest] = useState(false);

  const jurisdiction = mapNationalityToJurisdiction(client?.nationality || null, client?.country_of_issue || null);
  
  const VISIBLE_ROWS_LIMIT = 5;

  // Generate dynamic 360 view data based on client nationality
  const clientData = useMemo(() => {
    if (!clientId) return null;
    return generateClient360Data(clientId, client?.nationality || null, client?.country_of_issue || null);
  }, [clientId, client?.nationality, client?.country_of_issue]);

  if (loading || !client || !clientData) {
    return <div className="text-center py-8 text-muted-foreground">Loading client data...</div>;
  }

  const { 
    onPlatformProducts, 
    externalProducts, 
    platformCashAccounts, 
    willData, 
    shortTermProducts,
    riskProducts, 
    medicalAid,
    currencySymbol 
  } = clientData;

  // Calculate totals
  const onPlatformTotal = onPlatformProducts.reduce((sum, p) => sum + p.amountValue, 0);
  const externalTotal = externalProducts.reduce((sum, p) => sum + p.amountValue, 0);
  const platformCashTotal = platformCashAccounts.reduce((sum, a) => sum + a.amountValue, 0);

  const hasMoreOnPlatformRows = onPlatformProducts.length > VISIBLE_ROWS_LIMIT;
  const visibleOnPlatformProducts = showAllOnPlatform 
    ? onPlatformProducts 
    : onPlatformProducts.slice(0, VISIBLE_ROWS_LIMIT);

  const toggleRowExpand = (number: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      return next;
    });
  };

  if (showMedicalAidForm) {
    return (
      <AddMedicalAidForm
        onClose={() => setShowMedicalAidForm(false)}
        onSave={() => setShowMedicalAidForm(false)}
      />
    );
  }

  if (showRiskProductForm) {
    return (
      <AddRiskProductForm
        onClose={() => setShowRiskProductForm(false)}
        onSave={() => setShowRiskProductForm(false)}
      />
    );
  }

  if (showShortTermForm) {
    return (
      <AddShortTermForm
        onClose={() => setShowShortTermForm(false)}
        onSave={() => setShowShortTermForm(false)}
      />
    );
  }

  if (showWillForm) {
    return (
      <AddWillForm
        onClose={() => setShowWillForm(false)}
        onSave={() => setShowWillForm(false)}
      />
    );
  }

  if (showAstuteRequest) {
    return <AstuteRequestView onClose={() => setShowAstuteRequest(false)} />;
  }

  if (showQuoteWizard) {
    return (
      <QuoteWizardView
        onClose={() => setShowQuoteWizard(false)}
        jurisdiction={jurisdiction}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* On-Platform Investment Products */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              On-Platform Investment Products{" "}
              <span className="text-muted-foreground font-normal">| {formatTotal(onPlatformTotal, currencySymbol)}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => setShowQuoteWizard(true)}>+ Quote</Button>
              <span className="text-muted-foreground">|</span>
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => setShowNewBusinessWizard(true)}>+ New business</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground">Investment house</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Investment product</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Investment number</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Investment amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Income</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Recurring contribution</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Date applicable</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Advisor name</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOnPlatformProducts.map((product) => {
                const isExpanded = expandedRows.has(product.number);
                return (
                  <>
                    <TableRow key={product.number} className="border-b border-border/50">
                      <TableCell className="text-sm text-[hsl(180,70%,45%)]">{product.investmentHouse}</TableCell>
                      <TableCell className="text-sm">{product.product}</TableCell>
                      <TableCell className="text-sm">{product.number}</TableCell>
                      <TableCell className="text-sm">{product.amount}</TableCell>
                      <TableCell className="text-sm">{product.income}</TableCell>
                      <TableCell className="text-sm">{product.contribution}</TableCell>
                      <TableCell className="text-sm">{product.date}</TableCell>
                      <TableCell className="text-sm">{product.advisor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4 text-[hsl(180,70%,45%)]" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>Additional contribution</DropdownMenuItem>
                              <DropdownMenuItem>Rebalance</DropdownMenuItem>
                              <DropdownMenuItem>Switch</DropdownMenuItem>
                              <DropdownMenuItem>Phase-in</DropdownMenuItem>
                              <DropdownMenuItem>Withdraw</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {product.expandable && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => toggleRowExpand(product.number)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && product.details && (
                      <TableRow key={`${product.number}-details`} className="bg-muted/20 border-b border-border/50">
                        <TableCell></TableCell>
                        <TableCell className="text-sm text-muted-foreground py-1">
                          <div className="space-y-0.5">
                            {product.details.map((detail, i) => (
                              <div key={i}>{detail.label}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-sm py-1">
                          <div className="space-y-0.5">
                            {product.details.map((detail, i) => (
                              <div key={i}>{detail.amount}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell colSpan={5}></TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
          {hasMoreOnPlatformRows && !showAllOnPlatform && (
            <div className="p-3 border-t">
              <Button 
                variant="link" 
                className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal text-sm" 
                onClick={() => setShowAllOnPlatform(true)}
              >
                Load more...
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Investment Products */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              External Investment Products <span className="text-muted-foreground font-normal">| {formatTotal(externalTotal, currencySymbol)}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal">+ Existing</Button>
              <span className="text-muted-foreground">|</span>
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal">View Inactive</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground">Provider</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Product</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Contract</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Income</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Contribution</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Updated</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Source</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {externalProducts.map((product, index) => (
                <TableRow key={index} className="border-b border-border/50">
                  <TableCell className="text-sm text-[hsl(180,70%,45%)]">{product.provider}</TableCell>
                  <TableCell className="text-sm">{product.product}</TableCell>
                  <TableCell className="text-sm">{product.contract}</TableCell>
                  <TableCell className="text-sm">{product.amount}</TableCell>
                  <TableCell className="text-sm">{product.income}</TableCell>
                  <TableCell className="text-sm">{product.contribution}</TableCell>
                  <TableCell className="text-sm">{product.updated}</TableCell>
                  <TableCell className="text-sm">{product.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Platform Cash (renamed from Corporate Cash Manager) */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Platform Cash <span className="text-muted-foreground font-normal">| {formatTotal(platformCashTotal, currencySymbol)}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal">+ Platform Cash</Button>
              <span className="text-muted-foreground">|</span>
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal">View Inactive</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground">Account Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Date Opened</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Nominated Beneficiary</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Account Number</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Investment Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Source</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Date Closed</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformCashAccounts.map((account, index) => (
                <TableRow key={index} className="border-b border-border/50">
                  <TableCell className="text-sm text-[hsl(180,70%,45%)]">{account.name}</TableCell>
                  <TableCell className="text-sm">{account.dateOpened}</TableCell>
                  <TableCell className="text-sm">{account.beneficiary}</TableCell>
                  <TableCell className="text-sm">{account.accountNumber}</TableCell>
                  <TableCell className="text-sm">{account.amount}</TableCell>
                  <TableCell className="text-sm">{account.source}</TableCell>
                  <TableCell className="text-sm">{account.dateClosed}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Will */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Will</CardTitle>
            <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => { setShowWillForm(true); scrollToTop(); }}>+ Will</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground">Will</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Date Of Will</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Place Kept</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Receipt Number</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Executors</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Last Review Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {willData.map((will, index) => (
                <TableRow key={index} className="border-b border-border/50">
                  <TableCell className="text-sm">{will.hasWill}</TableCell>
                  <TableCell className="text-sm">{will.dateOfWill}</TableCell>
                  <TableCell className="text-sm text-[hsl(180,70%,45%)]">{will.placeKept}</TableCell>
                  <TableCell className="text-sm">{will.receiptNumber}</TableCell>
                  <TableCell className="text-sm">{will.executors}</TableCell>
                  <TableCell className="text-sm">{will.lastReview}</TableCell>
                  <TableCell className="text-sm">{will.notes}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Short Term */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Short Term</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => { setShowShortTermForm(true); scrollToTop(); }}>+ Short Term</Button>
              <span className="text-muted-foreground">|</span>
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal">View Inactive</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground">Insurer</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Policy Type</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Total Premium</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Review Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Broker</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Data Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortTermProducts.length > 0 ? (
                shortTermProducts.map((product, index) => (
                  <TableRow key={index} className="border-b border-border/50">
                    <TableCell className="text-sm text-[hsl(180,70%,45%)]">{product.insurer}</TableCell>
                    <TableCell className="text-sm">{product.policyType}</TableCell>
                    <TableCell className="text-sm">{product.totalPremium}</TableCell>
                    <TableCell className="text-sm">{product.reviewDate}</TableCell>
                    <TableCell className="text-sm">{product.broker}</TableCell>
                    <TableCell className="text-sm">{product.dataDate}</TableCell>
                    <TableCell className="text-sm">{product.source}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No short term products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Risk Products */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Risk Products</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => { setShowRiskProductForm(true); scrollToTop(); }}>+ Risk Products</Button>
              {jurisdiction === "ZA" && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => { setShowAstuteRequest(true); scrollToTop(); }}>Request Astute</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground">Holding Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Policy Number</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Effective Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Termination Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Payment Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Paid To Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Payment Due Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskProducts.map((product, index) => (
                <TableRow key={index} className="border-b border-border/50">
                  <TableCell className="text-sm text-[hsl(180,70%,45%)]">{product.holdingName}</TableCell>
                  <TableCell className="text-sm">{product.policyNumber}</TableCell>
                  <TableCell className="text-sm">{product.effectiveDate}</TableCell>
                  <TableCell className="text-sm">{product.terminationDate}</TableCell>
                  <TableCell className="text-sm">{product.paymentAmount}</TableCell>
                  <TableCell className="text-sm">{product.paidToDate}</TableCell>
                  <TableCell className="text-sm">{product.paymentDueDate}</TableCell>
                  <TableCell className="text-sm">{product.notes}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Medical Aid */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Medical Aid</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => { setShowMedicalAidForm(true); scrollToTop(); }}>+ Medical Aid</Button>
              {jurisdiction === "ZA" && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <Button variant="link" className="text-[hsl(180,70%,45%)] p-0 h-auto font-normal" onClick={() => { setShowAstuteRequest(true); scrollToTop(); }}>Request Astute</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium text-muted-foreground">Medical Scheme Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Medical Scheme Plan Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Membership Number</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Policy Active</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Indicative Premium</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Date Data Received</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicalAid.length > 0 ? (
                medicalAid.map((item, index) => (
                  <TableRow key={index} className="border-b border-border/50">
                    <TableCell className="text-sm text-[hsl(180,70%,45%)]">{item.schemeName}</TableCell>
                    <TableCell className="text-sm">{item.planName}</TableCell>
                    <TableCell className="text-sm">{item.membershipNumber}</TableCell>
                    <TableCell className="text-sm">{item.policyActive}</TableCell>
                    <TableCell className="text-sm">{item.premium}</TableCell>
                    <TableCell className="text-sm">{item.dateReceived}</TableCell>
                    <TableCell className="text-sm">{item.notes}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No medical aid found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <NewBusinessWizardDialog
        open={showNewBusinessWizard}
        onOpenChange={setShowNewBusinessWizard}
        jurisdiction={jurisdiction}
      />
    </div>
  );
};

export default Client360ViewTab;
