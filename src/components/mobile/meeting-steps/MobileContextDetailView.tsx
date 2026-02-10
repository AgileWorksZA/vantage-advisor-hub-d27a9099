import { ArrowLeft, Plus, FileText, Mail, ListTodo, File, Package, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { DetailView } from "./PrepStep";

interface MobileContextDetailViewProps {
  view: DetailView;
  onBack: () => void;
  onConvertToTask?: (title: string, description: string) => void;
}

export default function MobileContextDetailView({ view, onBack, onConvertToTask }: MobileContextDetailViewProps) {
  const { type, data } = view;

  const configs: Record<string, { icon: typeof FileText; color: string; label: string }> = {
    note: { icon: FileText, color: "bg-blue-500/10 text-blue-600", label: "Note" },
    communication: { icon: Mail, color: "bg-violet-500/10 text-violet-600", label: "Communication" },
    task: { icon: ListTodo, color: "bg-orange-500/10 text-orange-600", label: "Task" },
    document: { icon: File, color: "bg-rose-500/10 text-rose-600", label: "Document" },
    product: { icon: Package, color: "bg-emerald-500/10 text-emerald-600", label: "Product" },
    opportunity: { icon: TrendingUp, color: "bg-amber-500/10 text-amber-600", label: "Opportunity" },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <Badge variant="secondary" className={`text-xs gap-1 ${config.color}`}>
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {type === "note" && <NoteDetail data={data} />}
        {type === "communication" && <CommDetail data={data} />}
        {type === "task" && <TaskDetail data={data} />}
        {type === "document" && <DocumentDetail data={data} />}
        {type === "product" && <ProductDetail data={data} />}
        {type === "opportunity" && <OpportunityDetail data={data} onConvertToTask={onConvertToTask} />}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{typeof value === "string" ? value : value}</p>
    </div>
  );
}

function NoteDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.subject}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" value={format(new Date(data.date), "dd MMM yyyy")} />
        <Field label="Priority" value={data.priority} />
        <Field label="Type" value={data.interactionType} />
      </div>
    </div>
  );
}

function CommDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.subject}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Channel" value={data.channel} />
        <Field label="Date" value={format(new Date(data.date), "dd MMM yyyy")} />
      </div>
    </div>
  );
}

function TaskDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.title}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" value={data.taskType} />
        <Field label="Priority" value={data.priority} />
        <Field label="Status" value={data.status} />
        <Field label="Due Date" value={data.dueDate ? format(new Date(data.dueDate), "dd MMM yyyy") : "No date"} />
      </div>
      {data.isOverdue && (
        <Badge variant="destructive" className="text-xs">Overdue</Badge>
      )}
    </div>
  );
}

function DocumentDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.name}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status" value={data.status} />
        <Field label="Category" value={data.category} />
        <Field label="Expiry Date" value={data.expiryDate ? format(new Date(data.expiryDate), "dd MMM yyyy") : "N/A"} />
      </div>
    </div>
  );
}

function ProductDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.productName}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" value={data.category || "Uncategorised"} />
        <Field label="Current Value" value={data.currentValue ? `R ${data.currentValue.toLocaleString()}` : "N/A"} />
        <Field label="Status" value={data.status} />
      </div>
    </div>
  );
}

function OpportunityDetail({ data, onConvertToTask }: { data: any; onConvertToTask?: (t: string, d: string) => void }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.opportunityType}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Potential Revenue" value={data.potentialRevenue ? `R ${data.potentialRevenue.toLocaleString()}` : "N/A"} />
        <Field label="Confidence" value={data.confidence ? `${data.confidence}%` : "N/A"} />
        <Field label="Status" value={data.status} />
      </div>
      {data.suggestedAction && <Field label="Suggested Action" value={data.suggestedAction} />}
      {data.reasoning && <Field label="Reasoning" value={data.reasoning} />}
      {onConvertToTask && (
        <button
          onClick={() => onConvertToTask(
            `Follow up: ${data.opportunityType}`,
            `${data.suggestedAction || data.reasoning || data.opportunityType}`
          )}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] border border-[hsl(180,70%,45%)]/20 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Convert to Task
        </button>
      )}
    </div>
  );
}
