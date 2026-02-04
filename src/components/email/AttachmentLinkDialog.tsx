import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Pencil, Download, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { DocumentTypeSelect } from "./DocumentTypeSelect";
import { toast } from "sonner";

export interface AttachmentItem {
  id: string;
  name: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
}

interface AttachmentWithType extends AttachmentItem {
  documentType: string | null;
  isLinked: boolean;
}

interface AttachmentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: AttachmentItem[];
  onSave: (attachments: { id: string; documentType: string; isLinked: boolean }[]) => void;
  clientId?: string;
}

export const AttachmentLinkDialog = ({
  open,
  onOpenChange,
  attachments,
  onSave,
  clientId,
}: AttachmentLinkDialogProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [attachmentsWithTypes, setAttachmentsWithTypes] = useState<AttachmentWithType[]>(() =>
    attachments.map((a) => ({
      ...a,
      documentType: null,
      isLinked: false,
    }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(attachmentsWithTypes.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleAttachments = attachmentsWithTypes.slice(startIndex, startIndex + pageSize);

  const handleDocumentTypeChange = (id: string, documentType: string | null) => {
    setAttachmentsWithTypes((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, documentType, isLinked: !!documentType } : a
      )
    );
  };

  const handleToggleLinked = (id: string) => {
    setAttachmentsWithTypes((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isLinked: !a.isLinked } : a
      )
    );
  };

  const handleSave = () => {
    const linkedAttachments = attachmentsWithTypes
      .filter((a) => a.isLinked && a.documentType)
      .map((a) => ({
        id: a.id,
        documentType: a.documentType!,
        isLinked: a.isLinked,
      }));

    if (linkedAttachments.length === 0) {
      toast.error("Please select at least one attachment with a document type to save");
      return;
    }

    onSave(linkedAttachments);
    onOpenChange(false);
  };

  const handleDownload = (attachment: AttachmentItem) => {
    // Would trigger download logic
    toast.info(`Downloading ${attachment.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Attachment link confirmation popup</DialogTitle>
        </DialogHeader>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 bg-accent/50 border border-border rounded-lg">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Any attachments that you wish to link to the task have to have a document type selected.
            These documents will be saved to the linked client's profile.
          </p>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Document name</TableHead>
                <TableHead className="w-10 text-xs"></TableHead>
                <TableHead className="text-xs w-48">DocumentType</TableHead>
                <TableHead className="w-10 text-xs">View</TableHead>
                <TableHead className="w-16 text-xs">Linked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAttachments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No attachments
                  </TableCell>
                </TableRow>
              ) : (
                visibleAttachments.map((attachment) => (
                  <TableRow key={attachment.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {attachment.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingId(attachment.id)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DocumentTypeSelect
                        value={attachment.documentType}
                        onChange={(type) => handleDocumentTypeChange(attachment.id, type)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload(attachment)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={attachment.isLinked}
                        onCheckedChange={() => handleToggleLinked(attachment.id)}
                        disabled={!attachment.documentType}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {attachmentsWithTypes.length > pageSize && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>
              {startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, attachmentsWithTypes.length)} of{" "}
              {attachmentsWithTypes.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
