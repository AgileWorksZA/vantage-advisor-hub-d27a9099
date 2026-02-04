import { useRef, useCallback } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
} from "lucide-react";
import { PersonalizationPopover } from "./PersonalizationPopover";
import { CommunicationChannel } from "@/hooks/useCommunicationCampaigns";

// Configure DOMPurify for safe HTML rendering
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  channel: CommunicationChannel;
  placeholder?: string;
  maxLength?: number;
}

export const RichTextEditor = ({
  value,
  onChange,
  channel,
  placeholder = "Write your message...",
  maxLength,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertPersonalization = useCallback((variable: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(variable);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.innerHTML += variable;
      }
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      
      // For SMS, strip HTML and enforce max length
      if (channel === "SMS") {
        const textContent = editorRef.current.textContent || "";
        if (maxLength && textContent.length > maxLength) {
          content = textContent.slice(0, maxLength);
          editorRef.current.textContent = content;
        }
      }
      
      onChange(content);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // Simple text editor for SMS
  if (channel === "SMS") {
    const textLength = (editorRef.current?.textContent || value.replace(/<[^>]*>/g, "")).length;
    return (
      <div className="border border-border rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
          <PersonalizationPopover onInsert={handleInsertPersonalization} />
          <span className="text-xs text-muted-foreground">
            {textLength}/{maxLength || 160} characters
          </span>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[120px] p-3 outline-none text-sm"
          onInput={handleInput}
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
        />
      </div>
    );
  }

  // Push notification - title + short message
  if (channel === "Push") {
    return (
      <div className="border border-border rounded-md overflow-hidden">
        <div className="flex items-center gap-1 px-3 py-2 bg-muted/30 border-b border-border">
          <PersonalizationPopover onInsert={handleInsertPersonalization} />
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[80px] p-3 outline-none text-sm"
          onInput={handleInput}
          data-placeholder="Push notification message (keep it short)..."
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
        />
      </div>
    );
  }

  // Full WYSIWYG for Email and WhatsApp
  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/30 border-b border-border flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("underline")}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("justifyLeft")}
          title="Align left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("justifyCenter")}
          title="Align center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("justifyRight")}
          title="Align right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet list"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleInsertLink}
          title="Insert link"
        >
          <Link className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <PersonalizationPopover onInsert={handleInsertPersonalization} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[200px] p-4 outline-none text-sm prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        onInput={handleInput}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
      />
    </div>
  );
};
