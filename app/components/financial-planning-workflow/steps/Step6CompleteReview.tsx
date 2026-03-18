import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSignature, Calendar, Bell, CheckCircle, Clock, Send, Archive } from "lucide-react";
import { toast } from "sonner";

interface Step6Props {
  clientId: string;
  workflowId: string;
  onDataChange: () => void;
}

const MOCK_DOCUMENTS = [
  { id: "1", name: "Investment Policy Statement", sentAt: "2024-01-15", status: "Signed", signedAt: "2024-01-16" },
  { id: "2", name: "Risk Disclosure Document", sentAt: "2024-01-15", status: "Delivered", signedAt: null },
  { id: "3", name: "Discretionary Mandate", sentAt: "2024-01-15", status: "Awaiting", signedAt: null },
  { id: "4", name: "Fee Schedule Acknowledgment", sentAt: "2024-01-15", status: "Signed", signedAt: "2024-01-17" },
];

const REPORT_OPTIONS = [
  { id: "portfolio_valuation", name: "Portfolio Valuation", checked: true },
  { id: "performance_report", name: "Performance Report", checked: true },
  { id: "tax_statement", name: "Tax Statement", checked: true },
  { id: "fee_summary", name: "Fee Summary", checked: false },
  { id: "market_commentary", name: "Market Commentary", checked: false },
];

export const Step6CompleteReview = ({ clientId, workflowId, onDataChange }: Step6Props) => {
  const [meetingsTarget, setMeetingsTarget] = useState(2);
  const [meetingsCompleted, setMeetingsCompleted] = useState(0);
  const [reviewFrequency, setReviewFrequency] = useState("Quarterly");
  const [nextReviewDate, setNextReviewDate] = useState("");
  const [communicationPref, setCommunicationPref] = useState("Email");
  const [selectedReports, setSelectedReports] = useState(
    REPORT_OPTIONS.filter(r => r.checked).map(r => r.id)
  );

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
    onDataChange();
  };

  const handleSendReminder = (docId: string) => {
    toast.success("Reminder sent to client");
  };

  const handleCompleteWorkflow = () => {
    toast.success("Workflow marked as complete!");
  };

  const handleArchive = () => {
    toast.info("Workflow archived");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Signed": return "default";
      case "Delivered": return "secondary";
      default: return "outline";
    }
  };

  const signedCount = MOCK_DOCUMENTS.filter(d => d.status === "Signed").length;
  const allSigned = signedCount === MOCK_DOCUMENTS.length;

  return (
    <div className="space-y-4">
      {/* Document Signing Monitor */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Document Signing Status</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {signedCount} of {MOCK_DOCUMENTS.length} signed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DOCUMENTS.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.sentAt}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(doc.status)}>{doc.status}</Badge>
                  </TableCell>
                  <TableCell>{doc.signedAt || "-"}</TableCell>
                  <TableCell>
                    {doc.status !== "Signed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendReminder(doc.id)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Remind
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SLA Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Service Level Agreement</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Annual Meetings Target</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={meetingsTarget}
                onChange={e => {
                  setMeetingsTarget(Number(e.target.value));
                  onDataChange();
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Meetings Completed</Label>
              <Input
                type="number"
                min={0}
                max={meetingsTarget}
                value={meetingsCompleted}
                onChange={e => {
                  setMeetingsCompleted(Number(e.target.value));
                  onDataChange();
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Review Frequency</Label>
              <Select
                value={reviewFrequency}
                onValueChange={v => {
                  setReviewFrequency(v);
                  onDataChange();
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Semi-Annually">Semi-Annually</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Communication Preference</Label>
              <Select
                value={communicationPref}
                onValueChange={v => {
                  setCommunicationPref(v);
                  onDataChange();
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Video Call">Video Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Next Review Date</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="date"
                value={nextReviewDate}
                onChange={e => {
                  setNextReviewDate(e.target.value);
                  onDataChange();
                }}
              />
              <Button variant="outline" className="gap-2">
                <Bell className="w-4 h-4" />
                Set Reminder
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Reports to Provide</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {REPORT_OPTIONS.map(report => (
                <div key={report.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={report.id}
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => handleReportToggle(report.id)}
                  />
                  <Label htmlFor={report.id} className="text-sm cursor-pointer">
                    {report.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Completion Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">All steps completed</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
              {allSigned ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">All documents signed</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
              {nextReviewDate ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">Next review date set</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleCompleteWorkflow} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark Workflow Complete
            </Button>
            <Button variant="outline" onClick={handleArchive} className="gap-2">
              <Archive className="w-4 h-4" />
              Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
