import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, RotateCcw, Eye, Search, Mail, MessageSquare, Phone, Send } from "lucide-react";

const communicationCategories = [
  { icon: Mail, label: "Emails", count: 873, active: true },
  { icon: MessageSquare, label: "SMSes", count: 45, active: false },
  { icon: Phone, label: "Phone", count: 23, active: false },
  { icon: Send, label: "WhatsApp", count: 156, active: false },
  { icon: Mail, label: "Push notification", count: 12, active: false },
  { icon: Mail, label: "Webinar", count: 3, active: false },
  { icon: Mail, label: "Office events", count: 8, active: false },
];

const emailsData = [
  { id: 1, dateSent: "28 Jan 2026 14:30", from: "Vantage Communications", subject: "Insurance kick-off guide for new clients" },
  { id: 2, dateSent: "27 Jan 2026 10:15", from: "Johan Venter", subject: "Scheduled test report - January 2026" },
  { id: 3, dateSent: "25 Jan 2026 09:00", from: "Vantage Communications", subject: "Annual review reminder - Action required" },
  { id: 4, dateSent: "22 Jan 2026 16:45", from: "Johan Venter", subject: "Investment portfolio update - Q4 2025" },
  { id: 5, dateSent: "20 Jan 2026 11:30", from: "Vantage Communications", subject: "New product launch announcement" },
  { id: 6, dateSent: "18 Jan 2026 08:00", from: "Vantage Communications", subject: "Market update - Weekly digest" },
  { id: 7, dateSent: "15 Jan 2026 14:00", from: "Johan Venter", subject: "Meeting confirmation - Estate planning" },
  { id: 8, dateSent: "12 Jan 2026 10:30", from: "Vantage Communications", subject: "Tax season preparation guide" },
];

const ClientCommunicationTab = () => {
  const [emailPage, setEmailPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("Emails");

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Communication Categories */}
      <div className="w-64 shrink-0">
        <div className="bg-background rounded-lg border border-border">
          {communicationCategories.map((category) => (
            <button
              key={category.label}
              onClick={() => setActiveCategory(category.label)}
              className={`w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                activeCategory === category.label ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <category.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{category.label}</span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Emails Table */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Communication {activeCategory}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 w-64" />
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-normal text-muted-foreground w-12">#</TableHead>
                <TableHead className="text-xs font-normal text-muted-foreground">Date sent</TableHead>
                <TableHead className="text-xs font-normal text-muted-foreground">From</TableHead>
                <TableHead className="text-xs font-normal text-muted-foreground">Subject</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailsData.map((email) => (
                <TableRow key={email.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm">{email.id}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{email.dateSent}</TableCell>
                  <TableCell className="text-sm">{email.from}</TableCell>
                  <TableCell className="text-sm">{email.subject}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={emailPage === 1}>
            <ChevronFirst className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={emailPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {emailPage} of 44</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEmailPage(p => Math.min(44, p + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLast className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientCommunicationTab;
