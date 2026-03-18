import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, User, Users, FileText, Mail, Download, Send } from "lucide-react";
import { useClientDetail } from "@/hooks/useClientDetail";
import { useClientRelationships } from "@/hooks/useClientRelationships";
import { toast } from "sonner";

interface Step1Props {
  clientId: string;
  workflowId: string;
  onDataChange: () => void;
}

const WELCOME_PACK_DOCUMENTS = [
  { id: "intro_cover", name: "Introduction Cover Page", category: "Introduction Pack" },
  { id: "intro_letter", name: "Introduction Letter", category: "Introduction Pack" },
  { id: "office_info", name: "Office Information", category: "Introduction Pack" },
  { id: "fsca_mandate", name: "Discretionary FSCA Mandate", category: "Introduction Pack" },
  { id: "jse_mandate", name: "JSE Mandate", category: "Introduction Pack" },
  { id: "risk_discussion", name: "Risk Discussion Document", category: "Introduction Pack" },
  { id: "wealth_info", name: "FSP Wealth Information", category: "Introduction Pack" },
  { id: "fsp_history", name: "A Short History of Your FSP", category: "Introduction Pack" },
  { id: "privacy_policy", name: "Privacy Policy", category: "Additional Documents" },
  { id: "fee_schedule", name: "Fee Schedule", category: "Additional Documents" },
  { id: "complaints_procedure", name: "Complaints Procedure", category: "Additional Documents" },
];

export const Step1ClientIntroduction = ({ clientId, workflowId, onDataChange }: Step1Props) => {
  const { client, loading: clientLoading } = useClientDetail(clientId);
  const { familyMembers, loading: relationshipsLoading } = useClientRelationships(clientId);
  
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>(
    WELCOME_PACK_DOCUMENTS.map(d => d.id)
  );

  const handleDocToggle = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
    onDataChange();
  };

  const handleSelectAll = (category: string) => {
    const categoryDocs = WELCOME_PACK_DOCUMENTS.filter(d => d.category === category);
    const allSelected = categoryDocs.every(d => selectedDocs.includes(d.id));
    
    if (allSelected) {
      setSelectedDocs(prev => prev.filter(id => !categoryDocs.map(d => d.id).includes(id)));
    } else {
      setSelectedDocs(prev => [...new Set([...prev, ...categoryDocs.map(d => d.id)])]);
    }
    onDataChange();
  };

  const handleGeneratePack = () => {
    toast.success("Welcome pack generated successfully");
  };

  const handleSendEmail = () => {
    toast.success("Welcome pack sent via email");
  };

  const handleSendWhatsApp = () => {
    toast.success("Welcome pack sent via WhatsApp");
  };

  const groupedDocs = WELCOME_PACK_DOCUMENTS.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof WELCOME_PACK_DOCUMENTS>);

  return (
    <div className="space-y-4">
      {/* Client Details Section */}
      <Collapsible open={clientDetailsOpen} onOpenChange={setClientDetailsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Client Details</CardTitle>
                </div>
                {clientDetailsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {clientLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : client ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{client.first_name} {client.surname}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID Number:</span>
                    <span className="ml-2 font-medium">{client.id_number || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{client.email || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cell:</span>
                    <span className="ml-2 font-medium">{client.cell_number || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tax Number:</span>
                    <span className="ml-2 font-medium">{client.tax_number || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Adviser:</span>
                    <span className="ml-2 font-medium">{client.advisor || "Not assigned"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Client not found</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Family Members Section */}
      <Collapsible open={familyOpen} onOpenChange={setFamilyOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Family Members</CardTitle>
                  <span className="text-sm text-muted-foreground">({familyMembers.length})</span>
                </div>
                {familyOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {relationshipsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : familyMembers.length > 0 ? (
                <div className="space-y-2">
                  {familyMembers.map(rel => (
                    <div key={rel.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span>{rel.name}</span>
                      <span className="text-sm text-muted-foreground">{rel.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No family members linked</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Welcome Pack Generator - Primary Focus */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Welcome Pack Generator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{category}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(category)}
                >
                  {docs.every(d => selectedDocs.includes(d.id)) ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={doc.id}
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => handleDocToggle(doc.id)}
                    />
                    <Label htmlFor={doc.id} className="text-sm cursor-pointer">
                      {doc.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button onClick={handleGeneratePack} className="gap-2">
              <Download className="w-4 h-4" />
              Generate & Download Pack
            </Button>
            <Button variant="outline" onClick={handleSendEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Send via Email
            </Button>
            <Button variant="outline" onClick={handleSendWhatsApp} className="gap-2">
              <Send className="w-4 h-4" />
              Send via WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
