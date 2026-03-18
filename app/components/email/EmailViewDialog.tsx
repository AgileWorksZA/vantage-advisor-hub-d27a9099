import { useEffect } from "react";
import { useNavigate } from "react-router";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Reply, ChevronDown, ChevronUp, Loader2, Mail } from "lucide-react";
import { useEmailDetail, RelatedEmail } from "@/hooks/useEmailDetail";
import { AttachmentList } from "./AttachmentList";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EmailViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailId: string | null;
  onReply?: (emailId: string) => void;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${day}/${month}/${year} ${hour12}:${minutes} ${ampm}`;
};

const formatShortDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const EmailViewDialog = ({
  open,
  onOpenChange,
  emailId,
  onReply,
}: EmailViewDialogProps) => {
  const navigate = useNavigate();
  const { email, attachments, relatedEmails, loading } = useEmailDetail(
    open ? emailId : null
  );
  const [showPreviousMessages, setShowPreviousMessages] = useState(false);

  const handleReply = () => {
    if (!email) return;

    // Navigate to compose with reply data
    const replySubject = email.subject?.startsWith("RE:")
      ? email.subject
      : `RE: ${email.subject || ""}`;

    const quotedContent = `\n\n---\nOn ${formatDate(email.received_at || email.sent_at)}, ${email.from_address} wrote:\n> ${(email.body_preview || "").replace(/\n/g, "\n> ")}`;

    const params = new URLSearchParams({
      to: email.from_address,
      subject: replySubject,
      quote: quotedContent,
    });

    onOpenChange(false);
    navigate(`/email/compose?${params.toString()}`);
  };

  // Sanitize HTML content
  const sanitizedHtml = email?.body_html
    ? DOMPurify.sanitize(email.body_html, {
        ALLOWED_TAGS: [
          "p", "br", "div", "span", "strong", "b", "i", "em", "u",
          "ul", "ol", "li", "a", "table", "tr", "td", "th", "thead", "tbody",
          "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code"
        ],
        ALLOWED_ATTR: ["href", "target", "style", "class"],
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-[hsl(180,70%,45%)]" />
              Email Details
            </DialogTitle>
            <Button
              onClick={handleReply}
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
              size="sm"
              disabled={!email}
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : email ? (
          <ScrollArea className="flex-1 px-6 pb-6">
            {/* Email metadata */}
            <div className="space-y-2 py-4 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16 shrink-0">From:</span>
                <span className="font-medium">{email.from_address}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16 shrink-0">To:</span>
                <span>{email.to_addresses?.join(", ") || "-"}</span>
              </div>
              {email.cc_addresses && email.cc_addresses.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">CC:</span>
                  <span>{email.cc_addresses.join(", ")}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16 shrink-0">Date:</span>
                <span>{formatDate(email.received_at || email.sent_at)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
                <span className="font-medium">{email.subject || "(No Subject)"}</span>
              </div>
            </div>

            <Separator />

            {/* Email body */}
            <div className="py-4">
              {sanitizedHtml ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{email.body_preview || "No content"}</p>
              )}
            </div>

            {/* Attachments */}
            <AttachmentList attachments={attachments} />

            {/* Previous messages in thread */}
            {relatedEmails.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowPreviousMessages(!showPreviousMessages)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPreviousMessages ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Previous Messages ({relatedEmails.length})
                </button>

                {showPreviousMessages && (
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-muted">
                    {relatedEmails.map((related) => (
                      <div key={related.id} className="text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <span className="font-medium">
                            {related.direction === "Inbound" ? "From" : "To"}:{" "}
                            {related.from_address}
                          </span>
                          <span>•</span>
                          <span>{formatShortDate(related.received_at)}</span>
                        </div>
                        <p className="text-muted-foreground italic line-clamp-3">
                          {related.body_preview || "(No content)"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Email not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
