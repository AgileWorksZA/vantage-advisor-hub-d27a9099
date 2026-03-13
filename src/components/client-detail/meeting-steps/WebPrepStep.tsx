import { useState } from "react";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Mail, Phone, Package, TrendingUp, ListTodo, File, Sparkles, Loader2, X, Target } from "lucide-react";
import { format } from "date-fns";

export interface KeyOutcome {
  id: string;
  text: string;
  completed: boolean;
  origin: "prep" | "meeting" | "post-meeting";
  note: string | null;
  transcriptTimestamp: string | null;
  transcriptSnippet: string | null;
}

interface WebPrepStepProps {
  clientId: string | null;
  clientName?: string;
  keyOutcomes: KeyOutcome[];
  onAddOutcome: (text: string) => void;
  onRemoveOutcome: (id: string) => void;
}

export default function WebPrepStep({ clientId, clientName, keyOutcomes, onAddOutcome, onRemoveOutcome }: WebPrepStepProps) {
  const { notes, communications, tasks, documents, opportunities, products, loading } = useClientMeetingPrep(clientId);
  const [newOutcome, setNewOutcome] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const interactionIcon: Record<string, typeof Mail> = { Email: Mail, Call: Phone, Note: FileText };

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      onAddOutcome(newOutcome.trim());
      setNewOutcome("");
    }
  };

  return (
    <div className="space-y-5">
      {/* AI Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Prep Note</span>
      </div>

      {clientName && (
        <p className="text-sm text-muted-foreground">
          Prepared briefing for your meeting with <span className="font-medium text-foreground">{clientName}</span>
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* Previous Engagements */}
          {(notes.length > 0 || communications.length > 0) && (
            <Section title="Previous Engagements">
              {notes.map((n) => (
                <ContextRow key={n.id} icon={<FileText className="h-3.5 w-3.5" />} tagLabel="Note" tagColor="bg-blue-500/10 text-blue-600" text={n.subject} meta={format(new Date(n.date), "dd MMM")} />
              ))}
              {communications.map((c) => {
                const Icon = interactionIcon[c.channel] || Mail;
                return <ContextRow key={c.id} icon={<Icon className="h-3.5 w-3.5" />} tagLabel={c.channel} tagColor="bg-violet-500/10 text-violet-600" text={c.subject} meta={format(new Date(c.date), "dd MMM")} />;
              })}
            </Section>
          )}

          {/* Products */}
          {products.length > 0 && (
            <Section title="Transactions">
              {products.map((p) => (
                <ContextRow key={p.id} icon={<Package className="h-3.5 w-3.5" />} tagLabel="Product" tagColor="bg-emerald-500/10 text-emerald-600" text={p.productName} meta={p.currentValue ? `R ${p.currentValue.toLocaleString()}` : undefined} />
              ))}
            </Section>
          )}

          {/* Opportunities */}
          {opportunities.length > 0 && (
            <Section title="Opportunities for Growth">
              {opportunities.map((o) => (
                <ContextRow key={o.id} icon={<TrendingUp className="h-3.5 w-3.5" />} tagLabel="Opportunity" tagColor="bg-amber-500/10 text-amber-600" text={o.opportunityType} meta={o.potentialRevenue ? `R ${o.potentialRevenue.toLocaleString()}` : undefined} />
              ))}
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Outstanding Actions */}
          {(tasks.length > 0 || documents.length > 0) && (
            <Section title="Outstanding Actions">
              {tasks.map((t) => (
                <ContextRow key={t.id} icon={<ListTodo className="h-3.5 w-3.5" />} tagLabel="Task" tagColor={t.isOverdue ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-600"} text={t.title} meta={t.dueDate ? format(new Date(t.dueDate), "dd MMM") : "No date"} />
              ))}
              {documents.map((d) => (
                <ContextRow key={d.id} icon={<File className="h-3.5 w-3.5" />} tagLabel="Document" tagColor="bg-rose-500/10 text-rose-600" text={d.name} meta={d.status} />
              ))}
            </Section>
          )}

          {/* Recommended Actions */}
          <Section title="Recommended Actions">
            {opportunities.length > 0 && <ActionRow text={`Discuss ${opportunities[0].opportunityType.toLowerCase()} opportunity`} />}
            {documents.filter(d => d.status === "Expired").length > 0 && <ActionRow text="Review expiring documents" />}
            {tasks.filter(t => t.isOverdue).length > 0 && <ActionRow text={`Address ${tasks.filter(t => t.isOverdue).length} overdue task(s)`} />}
            {opportunities.length === 0 && documents.filter(d => d.status === "Expired").length === 0 && tasks.filter(t => t.isOverdue).length === 0 && (
              <p className="text-xs text-muted-foreground py-2">No urgent actions identified.</p>
            )}
          </Section>
        </div>
      </div>

      {/* Key Outcomes - full width */}
      <Section title="Key Outcomes">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Define desired outcomes for this meeting</span>
        </div>
        {keyOutcomes.map((outcome) => (
          <div key={outcome.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${
              outcome.origin === "prep" ? "bg-blue-500/10 text-blue-600" :
              outcome.origin === "meeting" ? "bg-primary/10 text-primary" :
              "bg-amber-500/10 text-amber-600"
            }`}>
              {outcome.origin === "prep" ? "Prep" : outcome.origin === "meeting" ? "Meeting" : "Post"}
            </Badge>
            <span className="text-sm text-foreground flex-1 truncate">{outcome.text}</span>
            <button onClick={() => onRemoveOutcome(outcome.id)} className="p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={newOutcome} onChange={(e) => setNewOutcome(e.target.value)} placeholder="Add an outcome..." className="text-sm h-9" onKeyDown={(e) => e.key === "Enter" && handleAddOutcome()} />
          <button onClick={handleAddOutcome} className="shrink-0 p-2 rounded-lg bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ContextRow({ icon, tagLabel, tagColor, text, meta }: { icon: React.ReactNode; tagLabel: string; tagColor: string; text: string; meta?: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 gap-1 shrink-0 ${tagColor}`}>
        {icon}
        {tagLabel}
      </Badge>
      <span className="text-sm text-foreground truncate flex-1">{text}</span>
      {meta && <span className="text-[10px] text-muted-foreground shrink-0">{meta}</span>}
    </div>
  );
}

function ActionRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-sm text-foreground flex-1">{text}</span>
    </div>
  );
}
