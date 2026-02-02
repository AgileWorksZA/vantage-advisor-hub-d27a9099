import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIOrb from "@/components/ai-assistant/AIOrb";
import InsightOrbit from "@/components/ai-assistant/InsightOrbit";
import ChatPanel from "@/components/ai-assistant/ChatPanel";
import OpportunityCard, { ClientOpportunity } from "@/components/ai-assistant/OpportunityCard";
import { useRegion } from "@/contexts/RegionContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { opportunities, formatCurrency, currencySymbol } = useRegion();
  const previousThemeRef = useRef<string | undefined>(undefined);
  const hasStoredThemeRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedOpportunities, setDisplayedOpportunities] = useState<ClientOpportunity[]>([]);

  // Store the initial theme before forcing dark mode
  useEffect(() => {
    // Only store theme once, when it's first resolved
    if (!hasStoredThemeRef.current && resolvedTheme) {
      previousThemeRef.current = theme || resolvedTheme;
      hasStoredThemeRef.current = true;
      setTheme("dark");
    }
  }, [resolvedTheme, theme, setTheme]);

  // Restore theme on unmount
  useEffect(() => {
    return () => {
      if (previousThemeRef.current && previousThemeRef.current !== "dark") {
        setTheme(previousThemeRef.current);
      }
    };
  }, [setTheme]);

  const counts = {
    upsell: opportunities.filter((o) => o.opportunityType === "upsell").length,
    crossSell: opportunities.filter((o) => o.opportunityType === "cross-sell").length,
    migration: opportunities.filter((o) => o.opportunityType === "migration").length,
    platform: opportunities.filter((o) => o.opportunityType === "platform").length,
    atRisk: 2, // Mock count for at-risk clients
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category === activeCategory ? null : category);
    
    if (category !== activeCategory) {
      // Filter opportunities by category
      let filtered: ClientOpportunity[];
      if (category === "at-risk") {
        filtered = []; // No mock data for at-risk
      } else {
        const typeMap: Record<string, ClientOpportunity["opportunityType"]> = {
          "upsell": "upsell",
          "cross-sell": "cross-sell",
          "migration": "migration",
          "platform": "platform",
        };
        filtered = opportunities.filter((o) => o.opportunityType === typeMap[category]);
      }
      setDisplayedOpportunities(filtered);
    } else {
      setDisplayedOpportunities([]);
    }
  };

  const handleOrbClick = () => {
    setIsChatOpen(true);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response with regional data
    setTimeout(() => {
      // Get top opportunity for each category
      const topUpsell = opportunities.find(o => o.opportunityType === "upsell");
      const topCrossSell = opportunities.find(o => o.opportunityType === "cross-sell");
      const topMigration = opportunities.find(o => o.opportunityType === "migration");
      const topPlatform = opportunities.find(o => o.opportunityType === "platform");

      const responses: Record<string, string> = {
        "upsell": `I've identified ${counts.upsell} clients with upselling potential. ${topUpsell?.clientName || "A client"} shows the highest opportunity with ${formatCurrency(topUpsell?.potentialRevenue || 0)} potential revenue from portfolio expansion.`,
        "cross-sell": `There's ${counts.crossSell} cross-sell opportunity this month. ${topCrossSell?.clientName || "A client"} needs protection products - a gap analysis could unlock ${formatCurrency(topCrossSell?.potentialRevenue || 0)} in new business.`,
        "migration": `${counts.migration} client is ready for portfolio migration. ${topMigration?.clientName || "A client"}'s external portfolio is underperforming - perfect timing to present our house view.`,
        "platform": `${counts.platform} client would benefit from platform consolidation. ${topPlatform?.clientName || "A client"} has assets across multiple platforms - consolidation could save them significant fees.`,
        "default": `Based on your client base analysis, I've identified several opportunities:\n\n• ${counts.upsell} upsell opportunities\n• ${counts.crossSell} cross-sell potential\n• ${counts.migration} migration candidate\n• ${counts.platform} platform consolidation\n\nClick on any category above to see detailed client opportunities.`,
      };

      let responseKey = "default";
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes("upsell") || lowerContent.includes("growth")) responseKey = "upsell";
      else if (lowerContent.includes("cross-sell")) responseKey = "cross-sell";
      else if (lowerContent.includes("migration") || lowerContent.includes("house")) responseKey = "migration";
      else if (lowerContent.includes("platform") || lowerContent.includes("consolidat")) responseKey = "platform";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[responseKey],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen gradient-mesh text-white overflow-hidden">
      {/* Background animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gradient-ai">AI Advisor Assistant</h1>
            <p className="text-white/50 text-sm">Discover opportunities in your client base</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
        {/* Insight Categories */}
        <div className="mb-12">
          <InsightOrbit
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
            counts={counts}
          />
        </div>

        {/* Opportunity Cards */}
        {displayedOpportunities.length > 0 && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedOpportunities.map((opportunity, index) => (
              <OpportunityCard 
                key={opportunity.clientId} 
                opportunity={opportunity} 
                index={index} 
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </main>

      {/* AI Orb - Fixed bottom right */}
      <div className="fixed bottom-8 right-8 z-40">
        <AIOrb isProcessing={isProcessing} isChatOpen={isChatOpen} onClick={handleOrbClick} />
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
        messages={messages}
        isTyping={isTyping}
      />
    </div>
  );
};

export default AIAssistant;
