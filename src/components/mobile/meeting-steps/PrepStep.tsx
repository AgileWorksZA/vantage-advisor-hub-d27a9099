import { useState } from "react";
import { useClientMeetingPrep, PrepNote, PrepComm, PrepTask, PrepDocument, PrepOpportunity, PrepProduct } from "@/hooks/useClientMeetingPrep";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Mail, Phone, Package, TrendingUp, ListTodo, File, Sparkles, Loader2, X, Target } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { KeyOutcome } from "../MobileMeetingScreen";

export interface DetailView {
  type: "note" | "communication" | "task" | "document" | "product" | "opportunity";
  id: string;
  data: any;
}

interface PrepStepProps {
  clientId: string | null;
  clientName?: string;
  onTagClick: (view: DetailView) => void;
  onConvertToTask: (title: string, description: string) => void;
  keyOutcomes: KeyOutcome[];
  onAddOutcome: (text: string) => void;
  onRemoveOutcome: (id: string) => void;
}

export default function PrepStep({ clientId, clientName, onTagClick, onConvertToTask, keyOutcomes, onAddOutcome, onRemoveOutcome }: PrepStepProps) {
  const { notes, communications, tasks, documents, opportunities, products, loading } = useClientMeetingPrep(clientId);
  const [newOutcome, setNewOutcome] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const interactionIcon: Record<string, typeof Mail> = {
    Email: Mail,
    Call: Phone,
    Note: FileText,
  };

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      onAddOutcome(newOutcome.trim());
      setNewOutcome("");
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* AI Header */}
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-[hsl(180,70%,45%)]" />
        <span className="text-xs font-semibold text-[hsl(180,70%,45%)] uppercase tracking-wider">AI Prep Note</span>
      </div>

      {clientName && (
        <p className="text-sm text-muted-foreground px-1">
          Prepared briefing for your meeting with <span className="font-medium text-foreground">{clientName}</span>
        </p>
      )}

      {/* Previous Engagements */}
      {(notes.length > 0 || communications.length > 0) && (
        <Section title="Previous Engagements">
          {notes.map((n) => (
            <ContextRow
              key={n.id}
              icon={<FileText className="h-3.5 w-3.5" />}
              tagLabel="Note"
              tagColor="bg-blue-500/10 text-blue-600"
              text={n.subject}
              meta={format(new Date(n.date), "dd MMM")}
              onClick={() => onTagClick({ type: "note", id: n.id, data: n })}
            />
          ))}
          {communications.map((c) => {
            const Icon = interactionIcon[c.channel] || Mail;
            return (
              <ContextRow
                key={c.id}
                icon={<Icon className="h-3.5 w-3.5" />}
                tagLabel={c.channel}
                tagColor="bg-violet-500/10 text-violet-600"
                text={c.subject}
                meta={format(new Date(c.date), "dd MMM")}
                onClick={() => onTagClick({ type: "communication", id: c.id, data: c })}
              />
            );
          })}
        </Section>
      )}

      {/* Transactions / Products */}
      {products.length > 0 && (
        <Section title="Transactions">
          {products.map((p) => (
            <ContextRow
              key={p.id}
              icon={<Package className="h-3.5 w-3.5" />}
              tagLabel="Product"
              tagColor="bg-emerald-500/10 text-emerald-600"
              text={p.productName}
              meta={p.currentValue ? `R ${p.currentValue.toLocaleString()}` : undefined}
              onClick={() => onTagClick({ type: "product", id: p.id, data: p })}
            />
          ))}
        </Section>
      )}

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <Section title="Opportunities for Growth">
          {opportunities.map((o) => (
            <ContextRow
              key={o.id}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              tagLabel="Opportunity"
              tagColor="bg-amber-500/10 text-amber-600"
              text={o.opportunityType}
              meta={o.potentialRevenue ? `R ${o.potentialRevenue.toLocaleString()}` : undefined}
              onClick={() => onTagClick({ type: "opportunity", id: o.id, data: o })}
            />
          ))}
        </Section>
      )}

      {/* Outstanding Actions */}
      {(tasks.length > 0 || documents.length > 0) && (
        <Section title="Outstanding Actions">
          {tasks.map((t) => (
            <ContextRow
              key={t.id}
              icon={<ListTodo className="h-3.5 w-3.5" />}
              tagLabel="Task"
              tagColor={t.isOverdue ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-600"}
              text={t.title}
              meta={t.dueDate ? format(new Date(t.dueDate), "dd MMM") : "No date"}
              onClick={() => onTagClick({ type: "task", id: t.id, data: t })}
            />
          ))}
          {documents.map((d) => (
            <ContextRow
              key={d.id}
              icon={<File className="h-3.5 w-3.5" />}
              tagLabel="Document"
              tagColor="bg-rose-500/10 text-rose-600"
              text={d.name}
              meta={d.status}
              onClick={() => onTagClick({ type: "document", id: d.id, data: d })}
            />
          ))}
        </Section>
      )}

      {/* Recommended Actions */}
      <Section title="Recommended Actions">
        {opportunities.length > 0 && (
          <ActionRow
            text={`Discuss ${opportunities[0].opportunityType.toLowerCase()} opportunity`}
            onConvert={() => onConvertToTask(
              `Discuss ${opportunities[0].opportunityType} with ${clientName || "client"}`,
              `Follow up on ${opportunities[0].opportunityType} opportunity. Potential revenue: R ${opportunities[0].potentialRevenue?.toLocaleString() || "N/A"}`
            )}
          />
        )}
        {documents.filter(d => d.status === "Expired").length > 0 && (
          <ActionRow
            text="Review expiring documents"
            onConvert={() => onConvertToTask(
              `Review expiring documents for ${clientName || "client"}`,
              `${documents.filter(d => d.status === "Expired").length} document(s) need attention`
            )}
          />
        )}
        {tasks.filter(t => t.isOverdue).length > 0 && (
          <ActionRow
            text={`Address ${tasks.filter(t => t.isOverdue).length} overdue task(s)`}
            onConvert={() => onConvertToTask(
              `Follow up on overdue tasks for ${clientName || "client"}`,
              `${tasks.filter(t => t.isOverdue).length} task(s) are past due`
            )}
          />
        )}
        {opportunities.length === 0 && documents.filter(d => d.status === "Expired").length === 0 && tasks.filter(t => t.isOverdue).length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No urgent actions identified. All looking good!</p>
        )}
      </Section>

      {/* Key Outcomes */}
      <Section title="Key Outcomes">
        <div className="flex items-center gap-2 px-1 mb-1">
          <Target className="h-3.5 w-3.5 text-[hsl(180,70%,45%)]" />
          <span className="text-xs text-muted-foreground">Define desired outcomes for this meeting</span>
        </div>
        {keyOutcomes.filter(o => o.origin === "prep").map((outcome) => (
          <div key={outcome.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 shrink-0">Prep</Badge>
            <span className="text-sm text-foreground flex-1 truncate">{outcome.text}</span>
            <button onClick={() => onRemoveOutcome(outcome.id)} className="p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {/* Also show meeting/post-meeting outcomes if any already exist */}
        {keyOutcomes.filter(o => o.origin !== "prep").map((outcome) => (
          <div key={outcome.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${outcome.origin === "meeting" ? "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]" : "bg-amber-500/10 text-amber-600"}`}>
              {outcome.origin === "meeting" ? "Meeting" : "Post"}
            </Badge>
            <span className="text-sm text-foreground flex-1 truncate">{outcome.text}</span>
            <button onClick={() => onRemoveOutcome(outcome.id)} className="p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={newOutcome}
            onChange={(e) => setNewOutcome(e.target.value)}
            placeholder="Add an outcome..."
            className="text-sm h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAddOutcome()}
          />
          <button
            onClick={handleAddOutcome}
            className="shrink-0 p-2 rounded-lg bg-[hsl(180,70%,45%)] text-white"
          >
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
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ContextRow({
  icon,
  tagLabel,
  tagColor,
  text,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  tagLabel: string;
  tagColor: string;
  text: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border text-left hover:bg-accent/50 transition-colors"
    >
      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 gap-1 shrink-0 ${tagColor}`}>
        {icon}
        {tagLabel}
      </Badge>
      <span className="text-sm text-foreground truncate flex-1">{text}</span>
      {meta && <span className="text-[10px] text-muted-foreground shrink-0">{meta}</span>}
    </button>
  );
}

function ActionRow({ text, onConvert }: { text: string; onConvert: () => void }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[hsl(180,70%,45%)]/5 border border-[hsl(180,70%,45%)]/20">
      <Sparkles className="h-3.5 w-3.5 text-[hsl(180,70%,45%)] shrink-0" />
      <span className="text-sm text-foreground flex-1">{text}</span>
      <button
        onClick={onConvert}
        className="p-1 rounded-md bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/20 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
