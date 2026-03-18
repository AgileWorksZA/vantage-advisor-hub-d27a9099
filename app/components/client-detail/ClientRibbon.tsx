import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  UserRound,
  Phone,
  Mail,
  Hash,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Client, getDisplayName, getInitials } from "@/types/client";
import ClientRibbonExpandedDetails from "./ClientRibbonExpandedDetails";

interface RelatedEntity {
  id: string;
  name: string;
  type: string;
}

interface ClientRibbonProps {
  client: Client;
  clientName: string;
  relatedEntities: RelatedEntity[];
  onTabChange?: (tab: string) => void;
  statusDotColor?: "red" | "orange" | "green";
}

const getProfileTypeBadgeClass = (profileType: string) => {
  switch (profileType?.toLowerCase()) {
    case "client":
      return "border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] bg-transparent";
    case "prospect":
      return "border-amber-500 text-amber-600 bg-transparent";
    case "lead":
      return "border-blue-500 text-blue-600 bg-transparent";
    default:
      return "border-muted-foreground text-muted-foreground bg-transparent";
  }
};

const getProfileStateBadgeClass = (profileState: string) => {
  switch (profileState?.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    case "onboarding in progress":
    case "onboarding":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const formatRibbonName = (client: Client): string => {
  const initial = client.initials || client.first_name?.[0] || "";
  const displayName = client.preferred_name || client.first_name;
  return `${client.surname}, ${initial} (${displayName})`;
};

const statusDotClasses: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  green: "bg-emerald-500",
};

const ClientRibbon = ({ client, clientName, relatedEntities, onTabChange, statusDotColor = "green" }: ClientRibbonProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const initials = getInitials(client);
  const idNumber = client.id_number || client.passport_number;
  const phoneNumber = client.cell_number || client.work_number;
  const email = client.email || client.work_email;
  const advisor = client.advisor || "Unassigned";

  return (
    <div>
      {/* Row 1: Back button, title, action buttons — condensed */}
      <div className="flex items-center justify-between mb-1 px-6 pt-1">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const from = searchParams.get("from");
              if (from === "dashboard") {
                navigate("/dashboard");
              } else {
                navigate("/clients");
              }
            }}
            className="gap-1.5 h-7 px-2.5 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
          <h1 className="text-base font-semibold">
            Manage individual (Owner) - {clientName}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Select defaultValue="personal-financial">
            <SelectTrigger className="w-[180px] h-7 text-xs">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal-financial">Personal financial report</SelectItem>
              <SelectItem value="investment-summary">Investment summary</SelectItem>
              <SelectItem value="risk-profile">Risk profile</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                Manage related entity
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {relatedEntities.length === 0 ? (
                <DropdownMenuItem disabled>No related entities</DropdownMenuItem>
              ) : (
                relatedEntities.map((entity) => (
                  <DropdownMenuItem
                    key={entity.id}
                    onClick={() => navigate(`/clients/${entity.id}`)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {entity.name}
                        {client.household_group && entity.name.split(" ").some(word => word.length > 1 && client.household_group!.includes(word)) && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-transparent dark:text-amber-400 dark:border-amber-400 text-[10px] px-1.5 py-0 ml-2">
                            Main Member
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{entity.type}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export client data</DropdownMenuItem>
              <DropdownMenuItem>Print profile</DropdownMenuItem>
              <DropdownMenuItem>Archive client</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete client</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 2: Expandable info bar */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="rounded-lg border border-border bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 px-5 py-2 mx-6">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-[hsl(180,25%,25%)] flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusDotClasses[statusDotColor]} rounded-full border-2 border-background`} />
            </div>

            {/* Info columns */}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              {/* Top line: name, advisor, badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <UserRound className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{formatRibbonName(client)}</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-muted-foreground">
                  A: <span className="font-medium text-foreground">{advisor}</span>
                </span>
                <span className="text-muted-foreground">|</span>
                <Badge
                  variant="outline"
                  className={getProfileTypeBadgeClass(client.profile_type)}
                >
                  {client.profile_type}
                </Badge>
                <Badge
                  variant="outline"
                  className={getProfileStateBadgeClass(client.profile_state)}
                >
                  {client.profile_state}
                </Badge>
                {client.household_group && (
                  <Badge
                    variant="outline"
                    className="border-purple-500 text-purple-600 bg-transparent dark:text-purple-400 dark:border-purple-400 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={() => onTabChange?.("relationships")}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {client.household_group}
                  </Badge>
                )}
                {client.household_group?.includes(client.surname) && (
                  <Badge
                    variant="outline"
                    className="border-amber-500 text-amber-600 bg-transparent dark:text-amber-400 dark:border-amber-400 text-[10px] px-1.5 py-0"
                  >
                    Main Member
                  </Badge>
                )}
              </div>

              {/* Bottom line: ID, phone, email */}
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {idNumber && (
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span>{idNumber}</span>
                  </div>
                )}
                {phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneNumber}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Expand/Collapse toggle */}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Expanded details */}
          <CollapsibleContent>
            <ClientRibbonExpandedDetails client={client} onEdit={() => onTabChange?.("details")} />
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default ClientRibbon;
