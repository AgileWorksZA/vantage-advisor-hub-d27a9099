import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Mail, Send, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";

interface Step4Props {
  clientId: string;
  workflowId: string;
  onDataChange: () => void;
}

const RECOMMENDATION_DOCUMENTS = {
  "Introduction Pack": [
    { id: "intro_cover", name: "Introduction Cover Page" },
    { id: "intro_letter", name: "Introduction Letter" },
    { id: "office_info", name: "Office Information" },
    { id: "fsca_mandate", name: "Discretionary FSCA Mandate" },
    { id: "jse_mandate", name: "JSE Mandate" },
    { id: "risk_discussion", name: "Risk Discussion" },
    { id: "wealth_info", name: "FSP Wealth Information" },
    { id: "fsp_history", name: "A Short History of Your FSP" },
  ],
  "Additional Documents": [
    { id: "client_info_sheet", name: "Client Information Sheet" },
    { id: "crs_fatca", name: "CRS-FATCA Form" },
    { id: "cashflow_report", name: "Cashflow Result Report" },
    { id: "asset_allocation", name: "Asset Allocation Cashflow Strategy" },
    { id: "fna_questionnaire", name: "Financial Needs Analysis Questionnaire" },
  ],
  "Product Appendices": [
    { id: "product_summary", name: "Product Summary" },
    { id: "fund_fact_sheets", name: "Fund Fact Sheets" },
    { id: "fee_disclosure", name: "Fee Disclosure" },
    { id: "terms_conditions", name: "Terms and Conditions" },
  ],
};

export const Step4PresentRecommendation = ({ clientId, workflowId, onDataChange }: Step4Props) => {
  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    Object.values(RECOMMENDATION_DOCUMENTS).flat().map(d => d.id)
  );
  const [personalMessage, setPersonalMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const handleDocToggle = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
    onDataChange();
  };

  const handleSelectAllCategory = (category: string) => {
    const categoryDocs = RECOMMENDATION_DOCUMENTS[category as keyof typeof RECOMMENDATION_DOCUMENTS];
    const allSelected = categoryDocs.every(d => selectedDocs.includes(d.id));
    
    if (allSelected) {
      setSelectedDocs(prev => prev.filter(id => !categoryDocs.map(d => d.id).includes(id)));
    } else {
      setSelectedDocs(prev => [...new Set([...prev, ...categoryDocs.map(d => d.id)])]);
    }
    onDataChange();
  };

  const handlePreview = () => {
    toast.info("Document preview opening...");
  };

  const handleDownload = () => {
    toast.success(`Recommendation pack with ${selectedDocs.length} documents downloaded`);
  };

  const handleSendEmail = () => {
    toast.success("Recommendation pack sent via email");
  };

  const handleSendWhatsApp = () => {
    toast.success("Recommendation pack sent via WhatsApp");
  };

  const handleSchedule = () => {
    if (scheduledDate) {
      toast.success(`Delivery scheduled for ${scheduledDate}`);
    } else {
      toast.error("Please select a delivery date");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Document Pack Customizer</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedDocs.length} documents selected
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(RECOMMENDATION_DOCUMENTS).map(([category, docs]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{category}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAllCategory(category)}
                >
                  {docs.every(d => selectedDocs.includes(d.id)) ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      id={doc.id}
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => handleDocToggle(doc.id)}
                    />
                    <Label htmlFor={doc.id} className="text-sm cursor-pointer flex-1">
                      {doc.name}
                    </Label>
                    <Button variant="ghost" size="sm" onClick={handlePreview}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Personalization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personalize Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Personal Message</Label>
            <Textarea
              id="message"
              placeholder="Add a personalized message to accompany the recommendation pack..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="schedule">Schedule Delivery</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <Button variant="outline" onClick={handleSchedule} className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download Complete Pack
            </Button>
            <Button variant="outline" onClick={handleSendEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Send via Email
            </Button>
            <Button variant="outline" onClick={handleSendWhatsApp} className="gap-2">
              <Send className="w-4 h-4" />
              Send via WhatsApp
            </Button>
            <Button variant="outline" disabled className="gap-2">
              Send to Client Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
