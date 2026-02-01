import { useState } from "react";
import { FileWarning, Upload, Eye, Send } from "lucide-react";
import { NudgeCard } from "./NudgeCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const expiringDocuments = [
  {
    id: 1,
    clientName: "Peter Williams",
    initials: "PW",
    documentType: "FICA - ID Document",
    expiryDate: "5 Feb 2026",
    daysUntilExpiry: 4,
    status: "critical",
  },
  {
    id: 2,
    clientName: "Sarah Joubert",
    initials: "SJ",
    documentType: "FICA - Proof of Address",
    expiryDate: "10 Feb 2026",
    daysUntilExpiry: 9,
    status: "warning",
  },
  {
    id: 3,
    clientName: "Van Der Berg Trust",
    initials: "VB",
    documentType: "Trust Deed",
    expiryDate: "15 Feb 2026",
    daysUntilExpiry: 14,
    status: "warning",
  },
  {
    id: 4,
    clientName: "Michael Naidoo",
    initials: "MN",
    documentType: "FICA - Tax Clearance",
    expiryDate: "3 Feb 2026",
    daysUntilExpiry: 2,
    status: "critical",
  },
];

export const DocumentExpiryNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const criticalCount = expiringDocuments.filter(
    (d) => d.status === "critical"
  ).length;

  const handleRequestDocument = (doc: (typeof expiringDocuments)[0]) => {
    toast.success(`Document request sent to ${doc.clientName}`);
  };

  const handleUploadDocument = (doc: (typeof expiringDocuments)[0]) => {
    toast.success(`Upload initiated for ${doc.clientName}'s ${doc.documentType}`);
  };

  return (
    <>
      <NudgeCard
        title="Document Expiry Alert"
        icon={<FileWarning className="w-4 h-4 text-destructive" />}
        reasoning={`${criticalCount} client documents expire within 7 days. FICA non-compliance may result in regulatory penalties.`}
        actionLabel="Manage Documents"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(0,84%,60%)"
        badge={`${expiringDocuments.length} expiring`}
      >
        <div className="space-y-2">
          {expiringDocuments.slice(0, 2).map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      doc.status === "critical"
                        ? "hsl(0,84%,60%)"
                        : "hsl(45,93%,47%)",
                  }}
                />
                <span className="truncate max-w-[100px]">{doc.clientName}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {doc.daysUntilExpiry}d
              </span>
            </div>
          ))}
          {expiringDocuments.length > 2 && (
            <p className="text-xs text-muted-foreground">
              +{expiringDocuments.length - 2} more...
            </p>
          )}
        </div>
      </NudgeCard>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Expiring Documents</SheetTitle>
            <SheetDescription>
              FICA and compliance documents requiring renewal
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {expiringDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 border rounded-lg"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor:
                    doc.status === "critical"
                      ? "hsl(0,84%,60%)"
                      : "hsl(45,93%,47%)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {doc.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doc.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.documentType}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      doc.status === "critical"
                        ? "border-destructive text-destructive"
                        : "border-[hsl(45,93%,47%)] text-[hsl(45,93%,47%)]"
                    }
                  >
                    {doc.daysUntilExpiry} days
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  Expires: {doc.expiryDate}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleRequestDocument(doc)}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Request
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUploadDocument(doc)}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
