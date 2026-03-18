import { FileText, Download, File, Image, FileSpreadsheet, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileIcon = (contentType: string, fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  
  if (contentType.includes("pdf") || extension === "pdf") {
    return <FileText className="w-5 h-5 text-destructive" />;
  }
  if (contentType.includes("image") || ["png", "jpg", "jpeg", "gif", "webp"].includes(extension || "")) {
    return <Image className="w-5 h-5 text-primary" />;
  }
  if (contentType.includes("spreadsheet") || ["xlsx", "xls", "csv"].includes(extension || "")) {
    return <FileSpreadsheet className="w-5 h-5 text-[hsl(180,70%,45%)]" />;
  }
  if (contentType.includes("presentation") || ["pptx", "ppt"].includes(extension || "")) {
    return <Presentation className="w-5 h-5 text-accent-foreground" />;
  }
  return <File className="w-5 h-5 text-muted-foreground" />;
};

export const AttachmentList = ({ attachments }: AttachmentListProps) => {
  if (attachments.length === 0) return null;

  const handleDownload = (attachment: Attachment) => {
    // Open the file path in a new tab for download/preview
    window.open(attachment.file_path, "_blank");
  };

  return (
    <div className="border-t border-border pt-4 mt-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        📎 Attachments ({attachments.length})
      </h4>
      <div className="flex flex-wrap gap-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors group"
          >
            {getFileIcon(attachment.content_type, attachment.file_name)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate max-w-[180px]">
                {attachment.file_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.file_size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDownload(attachment)}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
