import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client, getDisplayName, getInitials, calculateAge, formatBirthday } from "@/types/client";
import { 
  DollarSign, 
  Image, 
  MessageSquare, 
  User, 
  FileCheck, 
  MoreVertical 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface ClientSummaryTabProps {
  client: Client;
  clientId: string;
  onShowMoreActivity?: () => void;
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

// Demo recent activity data
const recentActivities = [
  {
    id: 1,
    type: "product_sold",
    title: "Product purchased",
    description: 'Client added "Discovery Life Plan"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: 2,
    type: "document_uploaded",
    title: "Document uploaded",
    description: 'Uploaded "ID Document.pdf"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: 3,
    type: "note_added",
    title: "Note added",
    description: 'Meeting notes: Discussed retirement planning options',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 4,
    type: "profile_updated",
    title: "Profile updated",
    description: 'Updated contact details and address',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 5,
    type: "compliance_created",
    title: "Compliance created",
    description: 'FAIS Control document generated',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "product_sold":
      return <DollarSign className="w-5 h-5 text-amber-500" />;
    case "document_uploaded":
      return <Image className="w-5 h-5 text-purple-500" />;
    case "note_added":
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case "profile_updated":
      return <User className="w-5 h-5 text-green-500" />;
    case "compliance_created":
      return <FileCheck className="w-5 h-5 text-[hsl(180,70%,45%)]" />;
    default:
      return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
  }
};

const getTitleColor = (type: string) => {
  switch (type) {
    case "product_sold":
      return "text-amber-600";
    case "document_uploaded":
      return "text-purple-600";
    case "note_added":
      return "text-blue-600";
    case "profile_updated":
      return "text-green-600";
    case "compliance_created":
      return "text-[hsl(180,70%,45%)]";
    default:
      return "text-foreground";
  }
};

const ClientSummaryTab = ({ client, clientId, onShowMoreActivity }: ClientSummaryTabProps) => {
  const displayName = getDisplayName(client);
  const initials = getInitials(client);
  const age = calculateAge(client.date_of_birth);
  const birthday = formatBirthday(client.date_of_birth);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* General Details */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">General details</CardTitle>
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-[hsl(180,70%,45%)] text-white text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                <div key={item.label} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Contact details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Work number", value: client.work_number || "-" },
                { label: "Work extension", value: client.work_extension || "-" },
                { label: "Work number secondary", value: "-" },
                { label: "Home number", value: client.home_number || "-" },
                { label: "Cell number", value: client.cell_number || "-" },
                { label: "Email", value: client.email || "-" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Current Advisor and Accounts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Current Advisor and Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Primary/Advisor</TableHead>
                  <TableHead className="text-xs">Relationship</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advisorData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">{row.type}</span>
                        <div>{client.advisor || row.advisor}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{client.relationship || row.relationship}</TableCell>
                    <TableCell className="text-sm">{client.rating || row.rating}</TableCell>
                    <TableCell className="text-sm">{row.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-0">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex gap-3 py-3 border-b border-border/50 last:border-0"
                  >
                    <div className="shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${getTitleColor(activity.type)}`}>
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Show more link */}
            <div className="pt-4 border-t mt-4">
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

        {/* Outstanding Documents */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Outstanding documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Document</TableHead>
                  <TableHead className="text-xs">Workflow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingDocs.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{doc.document}</TableCell>
                    <TableCell className="text-sm">{doc.workflow}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSummaryTab;
