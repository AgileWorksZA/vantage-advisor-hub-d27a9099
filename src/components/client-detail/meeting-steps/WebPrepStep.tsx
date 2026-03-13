import { useState, useEffect, useRef } from "react";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText, Mail, Phone, Package, TrendingUp, ListTodo, File, Sparkles, Loader2, X, Target, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface KeyOutcome {
  id: string;
  text: string;
  completed: boolean;
  origin: "prep" | "meeting" | "post-meeting";
  note: string | null;
  transcriptTimestamp: string | null;
  transcriptSnippet: string | null;
}

type DetailType = "note" | "communication" | "task" | "document" | "product" | "opportunity";

interface DetailView {
  type: DetailType;
  data: any;
}

interface WebPrepStepProps {
  clientId: string | null;
  clientName?: string;
  keyOutcomes: KeyOutcome[];
  onAddOutcome: (text: string) => void;
  onRemoveOutcome: (id: string) => void;
  eventId?: string;
  aiPrepNote?: string | null;
  onPrepNoteUpdated?: (note: string) => void;
}

export default function WebPrepStep({ clientId, clientName, keyOutcomes, onAddOutcome, onRemoveOutcome, eventId, aiPrepNote, onPrepNoteUpdated }: WebPrepStepProps) {
  const { notes, communications, tasks, documents, opportunities, products, loading } = useClientMeetingPrep(clientId);
  const [newOutcome, setNewOutcome] = useState("");
  const [generatingNote, setGeneratingNote] = useState(false);
  const [displayedNote, setDisplayedNote] = useState(aiPrepNote || "");
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedNote(aiPrepNote || "");
    setIsTyping(false);
    if (typingRef.current) clearInterval(typingRef.current);
  }, [aiPrepNote, eventId]);

  const handleGenerateNote = async () => {
    if (!eventId) return;
    setGeneratingNote(true);
    setDisplayedNote("");
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prep-note`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ calendarEventId: eventId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        toast.error(err.error || "Failed to generate note");
        setIsTyping(false);
        return;
      }

      const result = await response.json();
      const fullNote = result.note || "";

      // Typing animation
      let i = 0;
      typingRef.current = setInterval(() => {
        i += 2;
        if (i >= fullNote.length) {
          setDisplayedNote(fullNote);
          setIsTyping(false);
          if (typingRef.current) clearInterval(typingRef.current);
          onPrepNoteUpdated?.(fullNote);
        } else {
          setDisplayedNote(fullNote.slice(0, i));
        }
      }, 15);
    } catch (err: any) {
      toast.error("Failed to generate prep note");
      console.error(err);
      setIsTyping(false);
    } finally {
      setGeneratingNote(false);
    }
  };
  const [selectedDetail, setSelectedDetail] = useState<DetailView | null>(null);

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
      {/* AI Prep Note Card */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Prep Note</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateNote}
            disabled={generatingNote || !eventId}
            className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
          >
            {generatingNote ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {displayedNote ? "Regenerate" : "Generate Note"}
          </Button>
        </div>

        {displayedNote ? (
          <p className="text-sm text-foreground leading-relaxed">
            {displayedNote}
            {isTyping && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {generatingNote ? "Generating briefing..." : "Click 'Generate Note' to create an AI-powered meeting briefing based on client data."}
          </p>
        )}
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
                <ContextRow
                  key={n.id}
                  icon={<FileText className="h-3.5 w-3.5" />}
                  tagLabel="Note"
                  tagColor="bg-blue-500/10 text-blue-600"
                  text={n.subject}
                  meta={format(new Date(n.date), "dd MMM")}
                  onClick={() => setSelectedDetail({ type: "note", data: n })}
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
                    onClick={() => setSelectedDetail({ type: "communication", data: c })}
                  />
                );
              })}
            </Section>
          )}

          {/* Products */}
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
                  onClick={() => setSelectedDetail({ type: "product", data: p })}
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
                  onClick={() => setSelectedDetail({ type: "opportunity", data: o })}
                />
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
                <ContextRow
                  key={t.id}
                  icon={<ListTodo className="h-3.5 w-3.5" />}
                  tagLabel="Task"
                  tagColor={t.isOverdue ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-600"}
                  text={t.title}
                  meta={t.dueDate ? format(new Date(t.dueDate), "dd MMM") : "No date"}
                  onClick={() => setSelectedDetail({ type: "task", data: t })}
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
                  onClick={() => setSelectedDetail({ type: "document", data: d })}
                />
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
        <DialogContent className="max-w-md">
          {selectedDetail && <DetailContent detail={selectedDetail} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Detail Dialog Content ── */

function DetailContent({ detail }: { detail: DetailView }) {
  const { type, data } = detail;

  switch (type) {
    case "note":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <DetailField label="Subject" value={data.subject} />
            <DetailField label="Date" value={format(new Date(data.date), "dd MMM yyyy")} />
            {data.priority && <DetailField label="Priority" value={<Badge variant="secondary" className="text-xs">{data.priority}</Badge>} />}
            {data.interactionType && <DetailField label="Type" value={data.interactionType} />}
            {data.content && <DetailField label="Content" value={<p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.content}</p>} />}
          </div>
        </>
      );

    case "communication":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-violet-600" />
              Communication
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <DetailField label="Subject" value={data.subject} />
            <DetailField label="Channel" value={<Badge variant="secondary" className="text-xs">{data.channel}</Badge>} />
            <DetailField label="Date" value={format(new Date(data.date), "dd MMM yyyy")} />
            {data.summary && <DetailField label="Summary" value={<p className="text-sm text-muted-foreground">{data.summary}</p>} />}
          </div>
        </>
      );

    case "task":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-orange-600" />
              Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <DetailField label="Title" value={data.title} />
            {data.taskType && <DetailField label="Type" value={data.taskType} />}
            {data.priority && <DetailField label="Priority" value={<Badge variant="secondary" className="text-xs">{data.priority}</Badge>} />}
            {data.status && <DetailField label="Status" value={<Badge variant="outline" className="text-xs">{data.status}</Badge>} />}
            {data.dueDate && (
              <DetailField
                label="Due Date"
                value={
                  <span className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(data.dueDate), "dd MMM yyyy")}
                    {data.isOverdue && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-1">
                        <AlertTriangle className="h-3 w-3 mr-0.5" />
                        Overdue
                      </Badge>
                    )}
                  </span>
                }
              />
            )}
            {data.progress != null && (
              <DetailField
                label="Progress"
                value={
                  <div className="space-y-1">
                    <Progress value={data.progress} className="h-2" />
                    <span className="text-xs text-muted-foreground">{data.progress}%</span>
                  </div>
                }
              />
            )}
            {data.description && <DetailField label="Description" value={<p className="text-sm text-muted-foreground">{data.description}</p>} />}
          </div>
        </>
      );

    case "document":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="h-4 w-4 text-rose-600" />
              Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <DetailField label="Name" value={data.name} />
            <DetailField label="Status" value={
              <Badge variant="secondary" className={`text-xs ${data.status === "Expired" ? "bg-destructive/10 text-destructive" : ""}`}>
                {data.status}
              </Badge>
            } />
            {data.category && <DetailField label="Category" value={data.category} />}
            {data.expiryDate && <DetailField label="Expiry Date" value={format(new Date(data.expiryDate), "dd MMM yyyy")} />}
          </div>
        </>
      );

    case "product":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <DetailField label="Product" value={data.productName} />
            {data.category && <DetailField label="Category" value={data.category} />}
            {data.currentValue != null && <DetailField label="Current Value" value={`R ${data.currentValue.toLocaleString()}`} />}
            {data.status && <DetailField label="Status" value={<Badge variant="outline" className="text-xs">{data.status}</Badge>} />}
            {data.policyNumber && <DetailField label="Policy Number" value={data.policyNumber} />}
          </div>
        </>
      );

    case "opportunity":
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              Opportunity
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <DetailField label="Type" value={data.opportunityType} />
            {data.potentialRevenue != null && <DetailField label="Potential Revenue" value={`R ${data.potentialRevenue.toLocaleString()}`} />}
            {data.confidence && <DetailField label="Confidence" value={
              <div className="space-y-1">
                <Progress value={data.confidence} className="h-2" />
                <span className="text-xs text-muted-foreground">{data.confidence}%</span>
              </div>
            } />}
            {data.status && <DetailField label="Status" value={<Badge variant="outline" className="text-xs">{data.status}</Badge>} />}
            {data.suggestedAction && <DetailField label="Suggested Action" value={<p className="text-sm text-primary font-medium">{data.suggestedAction}</p>} />}
            {data.reasoning && <DetailField label="Reasoning" value={<p className="text-sm text-muted-foreground">{data.reasoning}</p>} />}
          </div>
        </>
      );

    default:
      return null;
  }
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-0.5">{typeof value === "string" ? <span className="text-sm text-foreground">{value}</span> : value}</div>
    </div>
  );
}

/* ── Shared sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ContextRow({ icon, tagLabel, tagColor, text, meta, onClick }: { icon: React.ReactNode; tagLabel: string; tagColor: string; text: string; meta?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border w-full text-left hover:bg-accent/50 transition-colors cursor-pointer"
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

function ActionRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-sm text-foreground flex-1">{text}</span>
    </div>
  );
}
