import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIOrb from "@/components/ai-assistant/AIOrb";
import InsightOrbit from "@/components/ai-assistant/InsightOrbit";
import ChatPanel from "@/components/ai-assistant/ChatPanel";
import OpportunityCard, { ClientOpportunity } from "@/components/ai-assistant/OpportunityCard";
import OpportunityMetrics from "@/components/ai-assistant/OpportunityMetrics";
import ProjectsList from "@/components/ai-assistant/ProjectsList";
import CreateProjectDialog from "@/components/ai-assistant/CreateProjectDialog";
import AddOpportunityDialog from "@/components/ai-assistant/AddOpportunityDialog";
import AddTaskDialog from "@/components/ai-assistant/AddTaskDialog";
import { useRegion } from "@/contexts/RegionContext";
import { useOpportunityProjects } from "@/hooks/useOpportunityProjects";
import { useProjectOpportunities } from "@/hooks/useProjectOpportunities";
import { useProjectTasks } from "@/hooks/useProjectTasks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { opportunities, formatCurrency, currencySymbol, selectedRegion } = useRegion();
  const previousThemeRef = useRef<string | undefined>(undefined);
  const hasStoredThemeRef = useRef(false);
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedOpportunities, setDisplayedOpportunities] = useState<ClientOpportunity[]>([]);
  
  // Dialog states
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddOpportunityOpen, setIsAddOpportunityOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [defaultProjectType, setDefaultProjectType] = useState("growth");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ClientOpportunity | null>(null);

  // Hooks for data
  const {
    projects,
    metrics: projectMetrics,
    createProject,
    updateProject,
    deleteProject,
    isLoading: projectsLoading,
  } = useOpportunityProjects(selectedRegion);

  const {
    opportunities: projectOpportunities,
    createOpportunity,
    isLoading: opportunitiesLoading,
  } = useProjectOpportunities();

  const {
    tasks: projectTasks,
    slaMetrics,
    createTask,
    updateTask,
    isLoading: tasksLoading,
  } = useProjectTasks();

  // Store the initial theme before forcing dark mode
  useEffect(() => {
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

  // Calculate counts for insight cards
  const counts = {
    upsell: opportunities.filter((o) => o.opportunityType === "upsell").length,
    crossSell: opportunities.filter((o) => o.opportunityType === "cross-sell").length,
    migration: opportunities.filter((o) => o.opportunityType === "migration").length,
    platform: opportunities.filter((o) => o.opportunityType === "platform").length,
    atRisk: 2, // Mock count for at-risk clients
  };

  // Calculate pipeline progress
  const totalOpps = projectOpportunities.length;
  const actionedOpps = projectOpportunities.filter(
    (o) => o.status === "Actioned" || o.status === "Won"
  ).length;
  const pipelineProgress = totalOpps > 0 ? Math.round((actionedOpps / totalOpps) * 100) : 0;

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category === activeCategory ? null : category);
    
    if (category !== activeCategory) {
      let filtered: ClientOpportunity[];
      if (category === "at-risk") {
        filtered = [];
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

  const handleCreateProjectFromCategory = (projectType: string) => {
    setDefaultProjectType(projectType);
    setIsCreateProjectOpen(true);
  };

  const handleCreateProject = (data: {
    name: string;
    description: string;
    project_type: string;
    target_revenue: number;
    target_date: string;
    sla_days: number;
  }) => {
    createProject.mutate({
      ...data,
      region_code: selectedRegion,
    }, {
      onSuccess: () => setIsCreateProjectOpen(false),
    });
  };

  const handleAddOpportunityToProject = (opportunity: ClientOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsAddOpportunityOpen(true);
  };

  const handleAddOpportunity = (data: {
    project_id: string;
    client_name: string;
    opportunity_type: string;
    current_value: number;
    potential_revenue: number;
    confidence: number;
    reasoning: string;
    suggested_action: string;
  }) => {
    createOpportunity.mutate(data, {
      onSuccess: () => {
        setIsAddOpportunityOpen(false);
        setSelectedOpportunity(null);
      },
    });
  };

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsAddTaskOpen(true);
  };

  const handleCreateTask = (data: {
    project_id: string;
    title: string;
    description: string;
    task_type: string;
    priority: string;
    due_date: string;
    sla_deadline: string;
    assigned_to: string;
  }) => {
    createTask.mutate(data, {
      onSuccess: () => {
        setIsAddTaskOpen(false);
        setSelectedProjectId(null);
      },
    });
  };

  const handleUpdateTaskStatus = (taskId: string, status: string) => {
    updateTask.mutate({ id: taskId, status });
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate(projectId);
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

    setTimeout(() => {
      const topUpsell = opportunities.find(o => o.opportunityType === "upsell");
      const topCrossSell = opportunities.find(o => o.opportunityType === "cross-sell");
      const topMigration = opportunities.find(o => o.opportunityType === "migration");
      const topPlatform = opportunities.find(o => o.opportunityType === "platform");

      const responses: Record<string, string> = {
        "upsell": `I've identified ${counts.upsell} clients with upselling potential. ${topUpsell?.clientName || "A client"} shows the highest opportunity with ${formatCurrency(topUpsell?.potentialRevenue || 0)} potential revenue from portfolio expansion.`,
        "cross-sell": `There's ${counts.crossSell} cross-sell opportunity this month. ${topCrossSell?.clientName || "A client"} needs protection products - a gap analysis could unlock ${formatCurrency(topCrossSell?.potentialRevenue || 0)} in new business.`,
        "migration": `${counts.migration} client is ready for portfolio migration. ${topMigration?.clientName || "A client"}'s external portfolio is underperforming - perfect timing to present our house view.`,
        "platform": `${counts.platform} client would benefit from platform consolidation. ${topPlatform?.clientName || "A client"} has assets across multiple platforms - consolidation could save them significant fees.`,
        "project": `You have ${projects.length} active projects with ${formatCurrency(projectMetrics.totalOpportunityValue)} in total opportunity value. ${projectMetrics.realizedRevenue > 0 ? `You've already realized ${formatCurrency(projectMetrics.realizedRevenue)}.` : "Start tracking progress to realize revenue."}`,
        "default": `Based on your client base analysis, I've identified several opportunities:\n\n• ${counts.upsell} upsell opportunities\n• ${counts.crossSell} cross-sell potential\n• ${counts.migration} migration candidate\n• ${counts.platform} platform consolidation\n\nYou have ${projects.length} active projects. Click on any category above to see detailed client opportunities, or create a project to start tracking.`,
      };

      let responseKey = "default";
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes("upsell") || lowerContent.includes("growth")) responseKey = "upsell";
      else if (lowerContent.includes("cross-sell")) responseKey = "cross-sell";
      else if (lowerContent.includes("migration") || lowerContent.includes("house")) responseKey = "migration";
      else if (lowerContent.includes("platform") || lowerContent.includes("consolidat")) responseKey = "platform";
      else if (lowerContent.includes("project") || lowerContent.includes("track")) responseKey = "project";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[responseKey],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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
            <h1 className="text-xl font-semibold text-gradient-ai">Growth & De-risking Hub</h1>
            <p className="text-white/50 text-sm">Discover and track opportunities in your client base</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto space-y-8 pb-24">
        {/* Metrics Dashboard */}
        <OpportunityMetrics
          totalOpportunityValue={projectMetrics.totalOpportunityValue}
          realizedRevenue={projectMetrics.realizedRevenue}
          activeProjects={projectMetrics.activeProjects}
          completedProjects={projectMetrics.completedProjects}
          pipelineProgress={pipelineProgress}
          slaHealth={slaMetrics}
          formatCurrency={formatCurrency}
        />

        {/* Insight Categories */}
        <div>
          <InsightOrbit
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
            onCreateProject={handleCreateProjectFromCategory}
            counts={counts}
          />
        </div>

        {/* Opportunity Cards (when category selected) */}
        {displayedOpportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedOpportunities.map((opportunity, index) => (
              <div key={opportunity.clientId} className="relative group">
                <OpportunityCard 
                  opportunity={opportunity} 
                  index={index} 
                  formatCurrency={formatCurrency}
                />
                {projects.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs"
                    onClick={() => handleAddOpportunityToProject(opportunity)}
                  >
                    + Add to Project
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects List */}
        <ProjectsList
          projects={projects}
          opportunities={projectOpportunities}
          tasks={projectTasks}
          activeFilter={activeCategory ? 
            (activeCategory === "upsell" || activeCategory === "cross-sell" ? "growth" :
             activeCategory === "at-risk" ? "derisking" :
             activeCategory === "platform" ? "consolidation" : activeCategory) 
            : null
          }
          onCreateProject={() => setIsCreateProjectOpen(true)}
          onEditProject={() => {}}
          onDeleteProject={handleDeleteProject}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTaskStatus}
          formatCurrency={formatCurrency}
        />
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

      {/* Dialogs */}
      <CreateProjectDialog
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreate={handleCreateProject}
        defaultType={defaultProjectType}
        currencySymbol={currencySymbol}
        isLoading={createProject.isPending}
      />

      <AddOpportunityDialog
        isOpen={isAddOpportunityOpen}
        onClose={() => {
          setIsAddOpportunityOpen(false);
          setSelectedOpportunity(null);
        }}
        onAdd={handleAddOpportunity}
        projects={projects}
        preselectedOpportunity={selectedOpportunity}
        currencySymbol={currencySymbol}
        isLoading={createOpportunity.isPending}
      />

      {selectedProjectId && (
        <AddTaskDialog
          isOpen={isAddTaskOpen}
          onClose={() => {
            setIsAddTaskOpen(false);
            setSelectedProjectId(null);
          }}
          onAdd={handleCreateTask}
          projectId={selectedProjectId}
          defaultSLADays={selectedProject?.sla_days || 30}
          isLoading={createTask.isPending}
        />
      )}
    </div>
  );
};

export default AIAssistant;
