import { useState } from "react";
import { ArrowLeft, Eye, Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AdvisorData } from "@/data/regionalData";
import AdvisorAvatar from "./AdvisorAvatar";

export interface PostEngagement {
  clientName: string;
  clientInitials: string;
  read: boolean;
  liked: boolean;
  readAt?: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorInitials: string;
  authorType: "client" | "advisor";
  content: string;
  timestamp: string;
}

export interface AdvisorPost {
  id: string;
  advisorInitials: string;
  advisorName: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: "text" | "market-update" | "insight";
  liked?: boolean;
  engagements?: PostEngagement[];
  commentsList?: PostComment[];
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

const typeBadge: Record<string, { label: string; className: string }> = {
  "market-update": { label: "Market Update", className: "bg-chart-1/20 text-chart-1" },
  insight: { label: "Insight", className: "bg-chart-2/20 text-chart-2" },
  text: { label: "Post", className: "bg-muted text-muted-foreground" },
};

interface MobilePostDetailViewProps {
  post: AdvisorPost;
  advisor: AdvisorData;
  onBack: () => void;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, comment: PostComment) => void;
}

const MobilePostDetailView = ({ post, advisor, onBack, onLike, onAddComment }: MobilePostDetailViewProps) => {
  const [replyText, setReplyText] = useState("");

  const engagements = post.engagements || [];
  const comments = post.commentsList || [];
  const readCount = engagements.filter(e => e.read).length;
  const likedCount = engagements.filter(e => e.liked).length;

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const newComment: PostComment = {
      id: crypto.randomUUID(),
      authorName: advisor.name,
      authorInitials: advisor.initials,
      authorType: "advisor",
      content: replyText.trim(),
      timestamp: new Date().toISOString(),
    };
    onAddComment(post.id, newComment);
    setReplyText("");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-foreground flex-1">Post Detail</span>
        <Badge className={cn("text-[9px] px-1.5 py-0", typeBadge[post.type]?.className)}>
          {typeBadge[post.type]?.label}
        </Badge>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Post content */}
        <div className="px-4 pt-3 pb-2 space-y-2">
          <div className="flex items-center gap-2">
            <AdvisorAvatar advisor={advisor} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{post.advisorName}</p>
              <p className="text-[10px] text-muted-foreground">{formatTimeAgo(post.timestamp)}</p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => onLike(post.id)}
              className={cn("flex items-center gap-1 text-xs", post.liked ? "text-destructive" : "text-muted-foreground")}
            >
              <Heart className={cn("h-3.5 w-3.5", post.liked && "fill-current")} />
              {post.likes}
            </button>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              {comments.length}
            </span>
          </div>
        </div>

        <Separator />

        {/* Engagement section */}
        <div className="px-4 py-3 space-y-2">
          <h3 className="text-xs font-semibold text-foreground">Who saw this</h3>
          <p className="text-[11px] text-muted-foreground">
            {readCount} of {engagements.length} clients read &middot; {likedCount} liked
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {engagements.map((eng, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                  {eng.clientInitials}
                </div>
                <span className="text-xs text-foreground flex-1 truncate">{eng.clientName}</span>
                <div className="flex items-center gap-1.5">
                  {eng.read && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {eng.readAt && <span>{formatTimeAgo(eng.readAt)}</span>}
                    </span>
                  )}
                  {eng.liked && <Heart className="h-3 w-3 text-destructive fill-current" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Comments section */}
        <div className="px-4 py-3 space-y-3">
          <h3 className="text-xs font-semibold text-foreground">Comments</h3>
          {comments.length === 0 && (
            <p className="text-[11px] text-muted-foreground">No comments yet. Be the first to reply.</p>
          )}
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                  c.authorType === "advisor" ? "bg-primary/15 text-primary" : "bg-accent text-accent-foreground"
                )}>
                  {c.authorInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">{c.authorName}</span>
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">
                      {c.authorType === "advisor" ? "Advisor" : "Client"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">{formatTimeAgo(c.timestamp)}</span>
                  </div>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reply input */}
      <div className="border-t border-border px-3 py-2 flex items-end gap-2">
        <Textarea
          placeholder="Write a reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="min-h-[36px] max-h-[80px] text-xs bg-muted/30 resize-none"
          rows={1}
        />
        <Button size="sm" onClick={handleSendReply} disabled={!replyText.trim()} className="h-8 w-8 p-0 shrink-0">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default MobilePostDetailView;
