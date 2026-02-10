import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Client, getDisplayName, getInitials, calculateAge, formatBirthday } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Users } from "lucide-react";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import { useHouseholdMeetingPrep } from "@/hooks/useHouseholdMeetingPrep";
import OpportunitiesTab, { getOpportunitiesCount } from "./next-best-action/OpportunitiesTab";
import OutstandingTab from "./next-best-action/OutstandingTab";
import RecentActivityTab, { RECENT_ACTIVITY_COUNT } from "./next-best-action/RecentActivityTab";
import { MeetingPrepSheet } from "./MeetingPrepSheet";
import { ClientCalendarEvent } from "@/hooks/useClientCalendarEvents";

interface ClientSummaryTabProps {
  client: Client;
  clientId: string;
  onShowMoreActivity?: () => void;
  onTabChange?: (tab: string) => void;
}

const advisorData = [
  { type: "Primary", advisor: "Jordaan, Danile", relationship: "Owner", rating: "5", role: "Financial Planner" },
  { type: "Secondary", advisor: "Van Zyl, Christo", relationship: "Shared", rating: "4", role: "Investment Advisor" },
];

const outstandingDocs = [
  { document: "FICA - Address verification", workflow: "FICA - Individual" },
  { document: "Proof of income", workflow: "Annual Review" },
  { document: "Risk profile questionnaire", workflow: "Advice Cycle" },
];

const ClientSummaryTab = ({ client, clientId, onShowMoreActivity, onTabChange }: ClientSummaryTabProps) => {
  const displayName = getDisplayName(client);
  const initials = getInitials(client);
  const age = calculateAge(client.date_of_birth);
  const birthday = formatBirthday(client.date_of_birth);
  const prepData = useClientMeetingPrep(clientId);

  const [householdView, setHouseholdView] = useState(false);
  const householdData = useHouseholdMeetingPrep(client.household_group, householdView);

  const [meetingPrepOpen, setMeetingPrepOpen] = useState(false);
  const [selectedMeetingEvent, setSelectedMeetingEvent] = useState<ClientCalendarEvent | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleOptimise = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1500);
  };

  const activeOpps = householdView ? householdData.opportunities : prepData.opportunities;
  const activeProducts = householdView ? householdData.products : prepData.products;
  const activeTasks = householdView ? householdData.tasks : prepData.tasks;
  const activeDocs = householdView ? householdData.documents : prepData.documents;

  const oppsCount = getOpportunitiesCount(activeOpps, activeProducts);
  const outstandingCount = activeTasks.length + activeDocs.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column */}
      <div className="space-y-4">
        {/* General Details */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-lg">General details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[
                { label: "Name", value: displayName },
                { label: "Title", value: client.title || "-" },
                { label: "Initials", value: client.initials || initials },
                { label: "Person type", value: client.person_type || "Individual" },
                { label: "ID Number", value: client.id_number || "-" },
                { label: "Country of issue", value: client.country_of_issue || "South Africa" },
                { label: "Gender", value: client.gender || "-" },
                { label: "Age", value: age.toString() },
                { label: "Birthday", value: birthday },
                { label: "Language", value: client.language || "English" },
                { label: "Tax number", value: client.tax_number || "-" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-0.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Advisor and Accounts */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Current Advisor and Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-8 px-3">Primary/Advisor</TableHead>
                  <TableHead className="text-xs h-8 px-3">Relationship</TableHead>
                  <TableHead className="text-xs h-8 px-3">Risk Rating</TableHead>
                  <TableHead className="text-xs h-8 px-3">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advisorData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm py-1.5 px-3">
                      <div>
                        <span className="text-xs text-muted-foreground">{row.type}</span>
                        <div>{client.advisor || row.advisor}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm py-1.5 px-3">{client.relationship || row.relationship}</TableCell>
                    <TableCell className="text-sm py-1.5 px-3">{client.rating || row.rating}</TableCell>
                    <TableCell className="text-sm py-1.5 px-3">{row.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Outstanding Documents */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Outstanding documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-8 px-3">Document</TableHead>
                  <TableHead className="text-xs h-8 px-3">Workflow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingDocs.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm py-1.5 px-3">{doc.document}</TableCell>
                    <TableCell className="text-sm py-1.5 px-3">{doc.workflow}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Next Best Action
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full">AI</span>
              </CardTitle>
              {client.household_group && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Household</span>
                  <Switch
                    checked={householdView}
                    onCheckedChange={setHouseholdView}
                    className="scale-75"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col">
            <Tabs defaultValue="opportunities" className="w-full flex-1 flex flex-col">
              <TabsList className="w-full h-8 mb-2">
                <TabsTrigger value="opportunities" className="text-xs flex-1">
                  Opportunities ({oppsCount})
                </TabsTrigger>
                <TabsTrigger value="outstanding" className="text-xs flex-1">
                  Outstanding ({outstandingCount})
                </TabsTrigger>
                <TabsTrigger value="recent" className="text-xs flex-1">
                  Recent Activity ({RECENT_ACTIVITY_COUNT})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="opportunities" className="mt-0 flex-1">
                <OpportunitiesTab opportunities={activeOpps} products={activeProducts} householdView={householdView} onOptimise={handleOptimise} hasScanned={hasScanned} isScanning={isScanning} />
              </TabsContent>
              <TabsContent value="outstanding" className="mt-0 flex-1">
                <OutstandingTab tasks={activeTasks} documents={activeDocs} householdView={householdView} />
              </TabsContent>
              <TabsContent value="recent" className="mt-0 flex-1">
                <RecentActivityTab
                  householdView={householdView}
                  clientId={clientId}
                  onCalendarEventClick={(event) => {
                    setSelectedMeetingEvent(event);
                    setMeetingPrepOpen(true);
                  }}
                  onActivityClick={(type) => onTabChange?.(type)}
                />
              </TabsContent>
            </Tabs>

            <div className="pt-1 border-t mt-1">
              <Button
                variant="link"
                className="p-0 h-auto text-[hsl(180,70%,45%)] hover:text-[hsl(180,70%,35%)]"
                onClick={onShowMoreActivity}
              >
                Show more
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MeetingPrepSheet
        open={meetingPrepOpen}
        onOpenChange={setMeetingPrepOpen}
        event={selectedMeetingEvent}
        clientId={clientId}
        onNavigate={(type) => {
          setMeetingPrepOpen(false);
          onTabChange?.(type === "note" ? "notes" : type === "communication" ? "communication" : type === "document" ? "documents" : type);
        }}
      />
    </div>
  );
};

export default ClientSummaryTab;
