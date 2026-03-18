import { format } from "date-fns";
import DOMPurify from "dompurify";

interface EmailQuotedContentProps {
  fromAddress: string;
  sentAt: string | null;
  toAddresses: string[] | null;
  subject: string | null;
  bodyHtml?: string | null;
  bodyText?: string | null;
}

export const EmailQuotedContent = ({
  fromAddress,
  sentAt,
  toAddresses,
  subject,
  bodyHtml,
  bodyText,
}: EmailQuotedContentProps) => {
  const formatSentDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "EEEE, d MMMM yyyy HH:mm");
  };

  const sanitizedBody = bodyHtml
    ? DOMPurify.sanitize(bodyHtml, {
        ALLOWED_TAGS: [
          "p", "br", "div", "span", "strong", "b", "i", "em", "u",
          "ul", "ol", "li", "a", "table", "tr", "td", "th", "thead", "tbody",
          "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
        ],
        ALLOWED_ATTR: ["href", "target", "style", "class"],
      })
    : null;

  return (
    <div className="border-l-4 border-[hsl(var(--brand-orange))] pl-4 mt-4 py-2">
      <div className="text-sm text-muted-foreground space-y-1 mb-4">
        <p>
          <strong>From:</strong> {fromAddress}
        </p>
        <p>
          <strong>Sent:</strong> {formatSentDate(sentAt)}
        </p>
        <p>
          <strong>To:</strong> {toAddresses?.join("; ") || "-"}
        </p>
        <p>
          <strong>Subject:</strong> {subject || "(No Subject)"}
        </p>
      </div>

      {sanitizedBody ? (
        <div
          className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />
      ) : (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {bodyText || ""}
        </p>
      )}
    </div>
  );
};

// Helper to generate quoted content HTML for inserting into editor
export const generateQuotedHtml = (
  fromAddress: string,
  sentAt: string | null,
  toAddresses: string[] | null,
  subject: string | null,
  bodyHtml?: string | null,
  bodyText?: string | null
): string => {
  const formatSentDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "EEEE, d MMMM yyyy HH:mm");
  };

  const body = bodyHtml || `<p>${bodyText || ""}</p>`;

  return `
<div style="border-left: 4px solid #d4a832; padding-left: 16px; margin-top: 16px;">
  <p style="color: #6b7280; font-size: 14px; margin: 4px 0;"><strong>From:</strong> ${fromAddress}</p>
  <p style="color: #6b7280; font-size: 14px; margin: 4px 0;"><strong>Sent:</strong> ${formatSentDate(sentAt)}</p>
  <p style="color: #6b7280; font-size: 14px; margin: 4px 0;"><strong>To:</strong> ${toAddresses?.join("; ") || "-"}</p>
  <p style="color: #6b7280; font-size: 14px; margin: 4px 0;"><strong>Subject:</strong> ${subject || "(No Subject)"}</p>
  <br/>
  ${body}
</div>
  `.trim();
};
