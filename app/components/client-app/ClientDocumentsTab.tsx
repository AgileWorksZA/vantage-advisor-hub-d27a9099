import { useMemo } from "react";
import { FileText, Upload, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface ClientDocumentsTabProps {
  clientName: string;
}

const ClientDocumentsTab = ({ clientName }: ClientDocumentsTabProps) => {
  const outstanding = useMemo(() => [
    { name: "Proof of Address", dueDate: "15 Mar 2026", priority: "high" },
    { name: "FICA Documents", dueDate: "20 Mar 2026", priority: "high" },
    { name: "Tax Certificate 2025", dueDate: "30 Apr 2026", priority: "medium" },
  ], []);

  const uploaded = useMemo(() => [
    { name: "ID Document", date: "12 Jan 2026", status: "approved" as const },
    { name: "Bank Statement", date: "05 Feb 2026", status: "approved" as const },
    { name: "Investment Application", date: "15 Feb 2026", status: "pending" as const },
    { name: "Risk Assessment Form", date: "18 Feb 2026", status: "approved" as const },
    { name: "Tax Return 2024", date: "01 Dec 2025", status: "approved" as const },
  ], []);

  const statusConfig = {
    approved: { label: "Approved", icon: CheckCircle, cls: "text-emerald-500 bg-emerald-500/10" },
    pending: { label: "Pending", icon: Clock, cls: "text-amber-500 bg-amber-500/10" },
    expired: { label: "Expired", icon: AlertTriangle, cls: "text-destructive bg-destructive/10" },
  };

  return (
    <div className="px-4 py-4 space-y-5">
      <h2 className="text-lg font-bold text-foreground">Documents</h2>

      {/* Outstanding */}
      {outstanding.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Outstanding ({outstanding.length})
          </h3>
          <div className="space-y-2">
            {outstanding.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">Due: {doc.dueDate}</p>
                  </div>
                </div>
                <button className="text-[10px] font-medium text-[hsl(220,60%,50%)] hover:underline shrink-0">Upload</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-[hsl(220,60%,50%)] hover:bg-[hsl(220,60%,50%)]/5 transition-colors">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Upload a Document</span>
      </button>

      {/* Uploaded */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Uploaded Documents</h3>
        <div className="space-y-1.5">
          {uploaded.map((doc, i) => {
            const sc = statusConfig[doc.status];
            const Icon = sc.icon;
            return (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.date}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${sc.cls}`}>
                  <Icon className="h-2.5 w-2.5" />
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientDocumentsTab;
