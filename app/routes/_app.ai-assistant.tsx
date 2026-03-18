import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import AIOrb from "@/components/ai-assistant/AIOrb";
import InsightOrbit from "@/components/ai-assistant/InsightOrbit";
import ChatPanel from "@/components/ai-assistant/ChatPanel";
import OpportunityCard, { ClientOpportunity } from "@/components/ai-assistant/OpportunityCard";
import OpportunityMetrics from "@/components/ai-assistant/OpportunityMetrics";
import OpportunitySelectionBar from "@/components/ai-assistant/OpportunitySelectionBar";
import OpportunitiesList from "@/components/ai-assistant/ProjectsList";
import CreateProjectDialog from "@/components/ai-assistant/CreateProjectDialog";
import AddOpportunityDialog from "@/components/ai-assistant/AddOpportunityDialog";
import AddTaskDialog from "@/components/ai-assistant/AddTaskDialog";
import ClientSelectionDialog from "@/components/ai-assistant/ClientSelectionDialog";
import AddSelectedToProjectDialog from "@/components/ai-assistant/AddSelectedToProjectDialog";
import PracticeValueIndicator from "@/components/ai-assistant/PracticeValueIndicator";
import NightSky from "@/components/ai-assistant/NightSky";
import { useRegion } from "@/contexts/RegionContext";
import { useOpportunityProjects } from "@/hooks/useOpportunityProjects";
import { useProjectOpportunities } from "@/hooks/useProjectOpportunities";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { useAIOpportunities, AIOpportunity } from "@/hooks/useAIOpportunities";
import { supabase } from "@/integrations/supabase/client";
import { getDemoProjects, getDemoTasks, DemoProject, DemoTask } from "@/data/demoProjects";
import { ClientWithValue } from "@/hooks/useClientOpportunityValues";
import { addDays } from "date-fns";

type TimeOfDay = "morning" | "afternoon" | "evening";

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
};

const getGreeting = (timeOfDay: TimeOfDay): string => {
  switch (timeOfDay) {
    case "morning":
      return "Good Morning";
    case "afternoon":
      return "Good Afternoon";
    default:
      return "Good Evening";
  }
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { formatCurrency, currencySymbol, selectedRegion

 } = useRegion();
  const previousThemeRef = useRef<string | undefined>(undefined);
  const hasStoredThemeRef = useRef(false);
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedOpportunities, setDisplayedOpportunities] = useState<AIOpportunity[]>([]);
  
  // Selection state for bulk operations
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<Set<string>>(new Set());
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  
  // Demo data
  const [demoProjects, setDemoProjects] = useState<DemoProject[]>([]);
  const [demoTasks, setDemoTasks] = useState<DemoTask[]>([]);
  
  // Dialog states
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddOpportunityOpen, setIsAddOpportunityOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isClientSelectionOpen, setIsClientSelectionOpen] = useState(false);
  const [defaultProjectType, setDefaultProjectType] = useState("growth");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<string>("growth");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<ClientOpportunity | null>(null);

  // Time-based greeting state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());
  const [userName, setUserName] = useState("");
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [displayedGreeting, setDisplayedGreeting] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  const [isSubtitleTypingComplete, setIsSubtitleTypingComplete] = useState(false);

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

  // AI-driven opportunity discovery from client database
  const {
    opportunities: aiOpportunities,
    counts: aiCounts,
    getOpportunitiesByType,
    calculateTotalValue,
    isLoading: aiOpportunitiesLoading,
    hasOpportunities,
  } = useAIOpportunities();

  // Fetch user's first name from profiles
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("user_id", user.id)
          .single();
        if (data?.first_name) {
          setUserName(data.first_name);
        }
      }
      setIsProfileLoaded(true);
    };
    fetchProfile();
  }, []);

  // Update time of day every minute
  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for greeting (waits for profile to load)
  useEffect(() => {
    // Don't start until profile is loaded
    if (!isProfileLoaded) return;
    
    const greeting = getGreeting(timeOfDay);
    const fullText = userName ? `${greeting}, ${userName}` : greeting;
    
    setDisplayedGreeting("");
    setIsTypingComplete(false);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedGreeting(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [userName, timeOfDay, isProfileLoaded]);

  // Typewriter effect for subtitle (starts after greeting completes)
  useEffect(() => {
    if (!isTypingComplete) {
      setDisplayedSubtitle("");
      setIsSubtitleTypingComplete(false);
      return;
    }
    
    const fullSubtitle = "Discover and track opportunities in your client base";
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullSubtitle.length) {
        setDisplayedSubtitle(fullSubtitle.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsSubtitleTypingComplete(true);
        clearInterval(interval);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [isTypingComplete]);

  // Load demo projects
  useEffect(() => {
    const demos = getDemoProjects(selectedRegion);
    const tasks = getDemoTasks(demos);
    setDemoProjects(demos);
    setDemoTasks(tasks);
  }, [selectedRegion]);

  // Calculate practice value metrics (combining real + demo data)
  const practiceMetrics = useMemo(() => {
    // Combine real projects with demo projects
    const allProjects = [...projects, ...demoProjects];
    
    const totalPotential = allProjects.reduce((acc, p) => acc + Number(p.target_revenue || 0), 0);
    const realized = allProjects.reduce((acc, p) => acc + Number(p.realized_revenue || 0), 0);
    const activeCount = allProjects.filter(p => p.status === "Active").length;
    const completedCount = allProjects.filter(p => p.status === "Completed").length;
    const totalProjects = allProjects.length;
    
    // Calculate percentages
    const actualPercent = totalPotential > 0 ? Math.round((realized / totalPotential) * 100) : 0;
    const inProgressPercent = totalProjects > 0 ? Math.round((activeCount / totalProjects) * 100) : 0;
    const notStartedPercent = totalProjects > 0 ? Math.round(((totalProjects - activeCount - completedCount) / totalProjects) * 100) : 100;

    return {
      existingRevenue: realized,
      potentialRevenue: totalPotential,
      actualPercent,
      inProgressPercent: Math.max(0, inProgressPercent),
      notStartedPercent: Math.max(0, notStartedPercent),
    };
  }, [projects, demoProjects]);

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

  // Use AI-discovered counts from hook
  const counts = {
    upsell: aiCounts.upsell,
    crossSell: aiCounts.crossSell,
    migration: aiCounts.migration,
    platform: aiCounts.platform,
    atRisk: aiCounts.atRisk,
  };

  // Combined projects for display
  const allProjects = useMemo(() => {
    const combined = [...projects, ...demoProjects.map(d => ({
      ...d,
      user_id: "",
      region_code: selectedRegion,
      updated_at: d.created_at,
      is_deleted: false,
    }))];
    return combined;
  }, [projects, demoProjects, selectedRegion]);

  // Combined tasks for display
  const allTasks = useMemo(() => {
    return [...projectTasks, ...demoTasks.map(t => ({
      ...t,
      user_id: "",
      opportunity_id: null,
      client_id: null,
      completed_at: null,
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    }))];
  }, [projectTasks, demoTasks]);

  // Calculate pipeline progress
  const totalOpps = projectOpportunities.length;
  const actionedOpps = projectOpportunities.filter(
    (o) => o.status === "Actioned" || o.status === "Won"
  ).length;
  const pipelineProgress = totalOpps > 0 ? Math.round((actionedOpps / totalOpps) * 100) : 0;

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category === activeCategory ? null : category);
    // Clear selection when changing categories
    setSelectedOpportunityIds(new Set());
    
    if (category !== activeCategory) {
      const filtered = getOpportunitiesByType(category);
      setDisplayedOpportunities(filtered);
    } else {
      setDisplayedOpportunities([]);
    }
  };

  const handleCreateProjectFromCategory = (projectType: string) => {
    setDefaultProjectType(projectType);
    setIsCreateProjectOpen(true);
  };

  // Selection handlers
  const handleToggleOpportunitySelect = (clientId: string) => {
    setSelectedOpportunityIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const handleSelectAllOpportunities = () => {
    const allIds = displayedOpportunities.map((o) => o.clientId);
    setSelectedOpportunityIds(new Set(allIds));
  };

  const handleClearSelection = () => {
    setSelectedOpportunityIds(new Set());
  };

  const selectedTotalValue = calculateTotalValue(selectedOpportunityIds);
  const allOpportunitiesSelected =
    displayedOpportunities.length > 0 &&
    displayedOpportunities.every((o) => selectedOpportunityIds.has(o.clientId));

  // Handle adding selected opportunities to project
  const handleAddSelectedToProject = async (
    projectId: string,
    opportunities: AIOpportunity[]
  ) => {
    setIsAddingBulk(true);
    try {
      const project = projects.find((p) => p.id === projectId);
      const slaDays = project?.sla_days || 30;

      for (const opp of opportunities) {
        // Create opportunity record
        await createOpportunity.mutateAsync({
          project_id: projectId,
          client_id: opp.clientId,
          client_name: opp.clientName,
          opportunity_type: opp.opportunityType,
          current_value: opp.currentValue,
          potential_revenue: opp.potentialRevenue,
          confidence: opp.confidence,
          reasoning: opp.reasoning,
          suggested_action: opp.suggestedAction,
        });

        // Create task for client
        await createTask.mutateAsync({
          project_id: projectId,
          client_id: opp.clientId,
          title: `Contact ${opp.clientName} - ${opp.opportunityType}`,
          description: `Follow up on ${opp.opportunityType} opportunity. ${opp.reasoning}`,
          task_type: "Action",
          priority: "Medium",
          due_date: addDays(new Date(), 7).toISOString().split("T")[0],
          sla_deadline: addDays(new Date(), slaDays).toISOString().split("T")[0],
        });
      }

      // Update project target revenue
      const totalNewRevenue = opportunities.reduce((acc, o) => acc + o.potentialRevenue, 0);
      const currentTarget = Number(project?.target_revenue) || 0;
      await updateProject.mutateAsync({
        id: projectId,
        target_revenue: currentTarget + totalNewRevenue,
      });

      setIsAddToProjectOpen(false);
      setSelectedOpportunityIds(new Set());
      // Remove added opportunities from displayed list
      setDisplayedOpportunities((prev) =>
        prev.filter((o) => !opportunities.some((added) => added.clientId === o.clientId))
      );
    } finally {
      setIsAddingBulk(false);
    }
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

  const handleAddClients = (projectId: string, projectType: string, projectName: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectType(projectType);
    setSelectedProjectName(projectName);
    setIsClientSelectionOpen(true);
  };

  const handleAddClientsToProject = async (clients: ClientWithValue[]) => {
    if (!selectedProjectId) return;
    
    const project = projects.find(p => p.id === selectedProjectId);
    const slaDays = project?.sla_days || 30;
    
    // Create opportunities and tasks for each selected client
    for (const client of clients) {
      // Create opportunity
      await createOpportunity.mutateAsync({
        project_id: selectedProjectId,
        client_id: client.id,
        client_name: client.name,
        opportunity_type: selectedProjectType,
        current_value: client.currentValue,
        potential_revenue: client.opportunityValue,
        confidence: 50,
        reasoning: `Added from client selection for ${selectedProjectType} project`,
        suggested_action: `Contact ${client.name} regarding ${selectedProjectType} opportunity`,
      });

      // Create task for client
      await createTask.mutateAsync({
        project_id: selectedProjectId,
        client_id: client.id,
        title: `Contact ${client.name} - ${selectedProjectType}`,
        description: `Follow up with ${client.name} regarding ${selectedProjectType} opportunity. Potential value: ${client.opportunityValue}`,
        task_type: "Action",
        priority: "Medium",
        due_date: addDays(new Date(), 7).toISOString().split("T")[0],
        sla_deadline: addDays(new Date(), slaDays).toISOString().split("T")[0],
      });
    }

    // Update project target revenue
    const totalNewRevenue = clients.reduce((acc, c) => acc + c.opportunityValue, 0);
    const currentTarget = Number(project?.target_revenue) || 0;
    await updateProject.mutateAsync({
      id: selectedProjectId,
      target_revenue: currentTarget + totalNewRevenue,
    });

    setIsClientSelectionOpen(false);
    setSelectedProjectId(null);
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
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const topUpsell = aiOpportunities.find(o => o.opportunityType === "upsell");
      const topCrossSell = aiOpportunities.find(o => o.opportunityType === "cross-sell");
      const topMigration = aiOpportunities.find(o => o.opportunityType === "migration");
      const topPlatform = aiOpportunities.find(o => o.opportunityType === "platform");

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
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className={`min-h-screen gradient-mesh-${timeOfDay} text-white overflow-y-auto`}>
      {/* Night sky elements (evening only) */}
      {timeOfDay === "evening" && <NightSky />}

      {/* Background animated elements - subtle for contrast */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm bg-black/20">
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
            <h1 className="text-xl font-semibold text-gradient-ai">
              {displayedGreeting}
              {!isTypingComplete && <span className="animate-pulse ml-0.5">|</span>}
            </h1>
            <p className="text-white/50 text-sm">
              {displayedSubtitle}
              {isTypingComplete && !isSubtitleTypingComplete && (
                <span className="animate-pulse ml-0.5">|</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Practice Value Indicator */}
        <PracticeValueIndicator
          existingRevenue={practiceMetrics.existingRevenue}
          potentialRevenue={practiceMetrics.potentialRevenue}
          actualPercent={practiceMetrics.actualPercent}
          inProgressPercent={practiceMetrics.inProgressPercent}
          notStartedPercent={practiceMetrics.notStartedPercent}
          formatCurrency={formatCurrency}
        />
      </header>

      {/* Main content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto space-y-6 pb-24">
        {/* Metrics Dashboard */}
        <OpportunityMetrics
          totalOpportunityValue={practiceMetrics.potentialRevenue}
          realizedRevenue={practiceMetrics.existingRevenue}
          activeProjects={allProjects.filter(p => p.status === "Active").length}
          completedProjects={allProjects.filter(p => p.status === "Completed").length}
          pipelineProgress={pipelineProgress}
          slaHealth={slaMetrics}
          formatCurrency={formatCurrency}
        />

        {/* Insight Categories */}
        <InsightOrbit
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
          onCreateProject={handleCreateProjectFromCategory}
          counts={counts}
        />

        {/* Opportunity Cards (when category selected) */}
        {displayedOpportunities.length > 0 && (
          <div className="space-y-4">
            {/* Selection Bar */}
            <OpportunitySelectionBar
              selectedCount={selectedOpportunityIds.size}
              totalCount={displayedOpportunities.length}
              totalValue={selectedTotalValue}
              onSelectAll={handleSelectAllOpportunities}
              onClearSelection={handleClearSelection}
              onAddToProject={() => setIsAddToProjectOpen(true)}
              allSelected={allOpportunitiesSelected}
              formatCurrency={formatCurrency}
            />
            
            {/* Opportunity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedOpportunities.map((opportunity, index) => (
                <OpportunityCard
                  key={opportunity.clientId}
                  opportunity={opportunity}
                  index={index}
                  formatCurrency={formatCurrency}
                  selectable={true}
                  isSelected={selectedOpportunityIds.has(opportunity.clientId)}
                  onToggleSelect={handleToggleOpportunitySelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state when category selected but no opportunities */}
        {activeCategory && displayedOpportunities.length === 0 && !aiOpportunitiesLoading && (
          <div className="text-center py-12">
            <p className="text-white/50 mb-4">
              No opportunities identified for this category yet.
            </p>
            <p className="text-white/40 text-sm">
              Import client data or check if clients have products linked.
            </p>
          </div>
        )}

        {/* Opportunities List - Always visible */}
        <OpportunitiesList
          projects={allProjects}
          opportunities={projectOpportunities}
          tasks={allTasks}
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
          onAddClients={handleAddClients}
          onUpdateTask={handleUpdateTaskStatus}
          formatCurrency={formatCurrency}
        />
      </main>


      {/* AI Orb - Fixed bottom right */}
      <div className="fixed bottom-8 right-8 z-50">
        <AIOrb isProcessing={isProcessing} isChatOpen={isChatOpen} onClick={handleOrbClick} />
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        isExpanded={false}
        onClose={() => setIsChatOpen(false)}
        onToggleExpand={() => {}}
        onSendMessage={handleSendMessage}
        messages={messages}
        isTyping={isTyping}
        currentPage="ai-assistant"
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

      {/* Client Selection Dialog */}
      <ClientSelectionDialog
        isOpen={isClientSelectionOpen}
        onClose={() => {
          setIsClientSelectionOpen(false);
          setSelectedProjectId(null);
        }}
        onAddClients={handleAddClientsToProject}
        projectType={selectedProjectType}
        projectName={selectedProjectName}
        existingClientIds={
          projectOpportunities
            .filter(o => o.project_id === selectedProjectId && o.client_id)
            .map(o => o.client_id!)
        }
        formatCurrency={formatCurrency}
        isLoading={createOpportunity.isPending || createTask.isPending}
      />

      {/* Add Selected Opportunities to Project Dialog */}
      <AddSelectedToProjectDialog
        isOpen={isAddToProjectOpen}
        onClose={() => setIsAddToProjectOpen(false)}
        onAddToExisting={handleAddSelectedToProject}
        onCreateNew={() => {
          setIsAddToProjectOpen(false);
          setIsCreateProjectOpen(true);
        }}
        selectedOpportunities={displayedOpportunities.filter((o) =>
          selectedOpportunityIds.has(o.clientId)
        )}
        projects={projects}
        formatCurrency={formatCurrency}
        isLoading={isAddingBulk}
      />
    </div>
  );
};

export default AIAssistant;
