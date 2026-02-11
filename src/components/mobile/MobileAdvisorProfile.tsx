import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Briefcase, Mail, Phone, GraduationCap, Heart, MessageCircle, Send, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AdvisorData } from "@/data/regionalData";
import { useRegion } from "@/contexts/RegionContext";
import AdvisorAvatar from "./AdvisorAvatar";
import MobilePostDetailView, { type AdvisorPost, type PostComment } from "./MobilePostDetailView";

interface AdvisorProfile {
  bio: string;
  specialisations: string[];
  qualifications: string[];
  email: string;
  phone: string;
  yearsExperience: number;
  office: string;
}

const regionLabels: Record<string, string> = {
  ZA: "South Africa",
  AU: "Australia",
  CA: "Canada",
  GB: "United Kingdom",
  US: "United States",
};

function getStorageKey(initials: string, region: string) {
  return `vantage-advisor-profile-${region}-${initials}`;
}

function getPostsKey(region: string) {
  return `vantage-advisor-posts-${region}`;
}

function getDefaultProfile(advisor: AdvisorData, region: string): AdvisorProfile {
  return {
    bio: `Experienced financial advisor with a passion for helping clients achieve their financial goals.`,
    specialisations: ["Wealth Management", "Retirement Planning", "Estate Planning"],
    qualifications: ["CFP®", "CFA"],
    email: `${advisor.name.split(" ")[0].toLowerCase()}@advisorfirst.com`,
    phone: "+1 555 000 0000",
    yearsExperience: 12,
    office: regionLabels[region] || region,
  };
}

function getDefaultPosts(advisor: AdvisorData): AdvisorPost[] {
  const demoClients = [
    { name: "James van der Berg", initials: "JV" },
    { name: "Sarah Mitchell", initials: "SM" },
    { name: "David Chen", initials: "DC" },
    { name: "Priya Naidoo", initials: "PN" },
    { name: "Robert Fourie", initials: "RF" },
    { name: "Emma Thompson", initials: "ET" },
    { name: "Michael Adams", initials: "MA" },
    { name: "Lisa Kruger", initials: "LK" },
  ];

  return [
    {
      id: "demo-1",
      advisorInitials: advisor.initials,
      advisorName: advisor.name,
      content: "Markets showed resilience this week despite geopolitical headwinds. I'm recommending clients maintain their current allocations while we monitor developments.",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      likes: 14,
      comments: 3,
      type: "market-update",
      engagements: demoClients.slice(0, 6).map((c, i) => ({
        clientName: c.name, clientInitials: c.initials,
        read: true, liked: i < 3,
        readAt: new Date(Date.now() - 86400000 * (1 + i * 0.3)).toISOString(),
      })),
      commentsList: [
        { id: "c1", authorName: "Sarah Mitchell", authorInitials: "SM", authorType: "client", content: "Thanks for the update — reassuring to hear.", timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString() },
        { id: "c2", authorName: advisor.name, authorInitials: advisor.initials, authorType: "advisor", content: "Happy to help, Sarah. Let's chat if you'd like to go deeper.", timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString() },
        { id: "c3", authorName: "David Chen", authorInitials: "DC", authorType: "client", content: "Should I be concerned about emerging market exposure?", timestamp: new Date(Date.now() - 86400000 * 0.8).toISOString() },
      ],
    },
    {
      id: "demo-2",
      advisorInitials: advisor.initials,
      advisorName: advisor.name,
      content: "Great session with clients today on tax-efficient withdrawal strategies. Remember: the order in which you draw from your accounts can make a significant difference to your retirement outcome.",
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      likes: 22,
      comments: 7,
      type: "insight",
      engagements: demoClients.slice(0, 7).map((c, i) => ({
        clientName: c.name, clientInitials: c.initials,
        read: true, liked: i < 5,
        readAt: new Date(Date.now() - 86400000 * (4 + i * 0.2)).toISOString(),
      })),
      commentsList: [
        { id: "c4", authorName: "James van der Berg", authorInitials: "JV", authorType: "client", content: "This is exactly what we discussed last week. Very helpful!", timestamp: new Date(Date.now() - 86400000 * 4.5).toISOString() },
        { id: "c5", authorName: "Priya Naidoo", authorInitials: "PN", authorType: "client", content: "Could you share the presentation slides?", timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
        { id: "c6", authorName: advisor.name, authorInitials: advisor.initials, authorType: "advisor", content: "Absolutely, Priya. I'll send them through this afternoon.", timestamp: new Date(Date.now() - 86400000 * 3.8).toISOString() },
        { id: "c7", authorName: "Emma Thompson", authorInitials: "ET", authorType: "client", content: "Would love a follow-up session on this topic.", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      ],
    },
    {
      id: "demo-3",
      advisorInitials: advisor.initials,
      advisorName: advisor.name,
      content: "Excited to share that I've completed my advanced estate planning certification! Looking forward to bringing even more value to my clients' multi-generational wealth strategies.",
      timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
      likes: 45,
      comments: 12,
      type: "text",
      engagements: demoClients.map((c, i) => ({
        clientName: c.name, clientInitials: c.initials,
        read: true, liked: i < 6,
        readAt: new Date(Date.now() - 86400000 * (9 + i * 0.1)).toISOString(),
      })),
      commentsList: [
        { id: "c8", authorName: "Robert Fourie", authorInitials: "RF", authorType: "client", content: "Congratulations! Well deserved.", timestamp: new Date(Date.now() - 86400000 * 9.5).toISOString() },
        { id: "c9", authorName: "Lisa Kruger", authorInitials: "LK", authorType: "client", content: "Amazing achievement — looking forward to the insights!", timestamp: new Date(Date.now() - 86400000 * 9).toISOString() },
      ],
    },
  ];
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

interface MobileAdvisorProfileProps {
  advisor: AdvisorData;
  onBack: () => void;
}

const MobileAdvisorProfile = ({ advisor, onBack }: MobileAdvisorProfileProps) => {
  const { selectedRegion } = useRegion();
  const [isEditing, setIsEditing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPost, setSelectedPost] = useState<AdvisorPost | null>(null);

  const [profile, setProfile] = useState<AdvisorProfile>(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(advisor.initials, selectedRegion));
      if (stored) return JSON.parse(stored);
    } catch {}
    return getDefaultProfile(advisor, selectedRegion);
  });

  const [posts, setPosts] = useState<AdvisorPost[]>(() => {
    try {
      const stored = localStorage.getItem(getPostsKey(selectedRegion));
      if (stored) return JSON.parse(stored);
    } catch {}
    return getDefaultPosts(advisor);
  });

  useEffect(() => {
    localStorage.setItem(getStorageKey(advisor.initials, selectedRegion), JSON.stringify(profile));
  }, [profile, advisor.initials, selectedRegion]);

  useEffect(() => {
    localStorage.setItem(getPostsKey(selectedRegion), JSON.stringify(posts));
  }, [posts, selectedRegion]);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: AdvisorPost = {
      id: crypto.randomUUID(),
      advisorInitials: advisor.initials,
      advisorName: advisor.name,
      content: newPostContent.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      type: "text",
    };
    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
        : p
    ));
  };

  const handleAddComment = (postId: string, comment: PostComment) => {
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, commentsList: [...(p.commentsList || []), comment], comments: (p.comments || 0) + 1 }
        : p
    ));
  };

  const typeBadge: Record<string, { label: string; className: string }> = {
    "market-update": { label: "Market Update", className: "bg-chart-1/20 text-chart-1" },
    insight: { label: "Insight", className: "bg-chart-2/20 text-chart-2" },
    text: { label: "Post", className: "bg-muted text-muted-foreground" },
  };

  // If a post is selected, show the detail overlay
  if (selectedPost) {
    const currentPost = posts.find(p => p.id === selectedPost.id) || selectedPost;
    return (
      <MobilePostDetailView
        post={currentPost}
        advisor={advisor}
        onBack={() => setSelectedPost(null)}
        onLike={handleLike}
        onAddComment={handleAddComment}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
        <button onClick={onBack} className="absolute top-3 left-3 p-1.5 rounded-full bg-background/80 backdrop-blur">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute -bottom-10 left-4">
          <AdvisorAvatar advisor={advisor} size="lg" className="border-4 border-background shadow-lg" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pt-12 px-4 pb-4 space-y-4">
        {/* Name & role */}
        <div>
          <h1 className="text-lg font-bold text-foreground">{advisor.name}</h1>
          <p className="text-sm text-muted-foreground">Financial Advisor</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="h-3 w-3 mr-1" />
              {regionLabels[selectedRegion]}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              <Briefcase className="h-3 w-3 mr-1" />
              {profile.yearsExperience} years
            </Badge>
          </div>
        </div>

        <Separator />

        {/* About */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-foreground">About</h2>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Done" : "Edit"}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="text-sm min-h-[60px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
        </section>

        {/* Specialisations */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" /> Specialisations
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.specialisations.map((s) => (
              <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>
            ))}
          </div>
        </section>

        {/* Qualifications */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" /> Qualifications
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.qualifications.map((q) => (
              <Badge key={q} variant="outline" className="text-[11px]">{q}</Badge>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Contact</h2>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              {isEditing ? (
                <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-7 text-sm" />
              ) : (
                <span>{profile.email}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              {isEditing ? (
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="h-7 text-sm" />
              ) : (
                <span>{profile.phone}</span>
              )}
            </div>
          </div>
        </section>

        <Separator />

        {/* Create Post */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Create Post</h2>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              <AdvisorAvatar advisor={advisor} size="sm" />
              <Textarea
                placeholder="Share an update with your clients..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[60px] text-sm bg-background"
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent.trim()} className="h-7 text-xs gap-1">
                <Send className="h-3 w-3" /> Post
              </Button>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Posts</h2>
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="rounded-lg border border-border bg-card p-3 space-y-2 cursor-pointer active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AdvisorAvatar advisor={advisor} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{post.advisorName}</p>
                  <p className="text-[10px] text-muted-foreground">{formatTimeAgo(post.timestamp)}</p>
                </div>
                <Badge className={cn("text-[9px] px-1.5 py-0", typeBadge[post.type]?.className)}>
                  {typeBadge[post.type]?.label}
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">{post.content}</p>
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                  className={cn("flex items-center gap-1 text-xs", post.liked ? "text-destructive" : "text-muted-foreground")}
                >
                  <Heart className={cn("h-3.5 w-3.5", post.liked && "fill-current")} />
                  {post.likes}
                </button>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.commentsList?.length || post.comments}
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default MobileAdvisorProfile;
