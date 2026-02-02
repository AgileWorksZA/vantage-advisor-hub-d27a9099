import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/types/client";
import { toast } from "sonner";

interface ClientCRMTabProps {
  client: Client;
  onUpdate: (updates: Partial<Client>) => Promise<boolean | undefined>;
}

const sportsInterests = [
  ["Aerobic", "Cricket", "Golf", "Horseriding", "Rugby"],
  ["Boxing", "Cycling", "Gym", "Martial Arts", "Running"],
  ["Chess", "Fishing", "Hiking", "Mountain biking", "Scuba diving"],
];

const ClientCRMTab = ({ client, onUpdate }: ClientCRMTabProps) => {
  const [formData, setFormData] = useState({
    language: client.language || "English",
    race: client.race || "",
    nationality: client.nationality || "South African",
    religion: client.religion || "",
    is_smoker: client.is_smoker || false,
    is_professional: client.is_professional || false,
    is_hybrid_client: client.is_hybrid_client || false,
    profession: client.profession || "",
    occupation: client.occupation || "",
    industry: client.industry || "",
    disability_type: client.disability_type || "",
    preferred_contact: client.preferred_contact || "",
    preferred_phone: client.preferred_phone || "",
    preferred_email: client.preferred_email || "",
    otp_delivery_method: client.otp_delivery_method || "SMS",
    sports_interests: client.sports_interests || [],
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSportToggle = (sport: string) => {
    const current = formData.sports_interests || [];
    const updated = current.includes(sport)
      ? current.filter(s => s !== sport)
      : [...current, sport];
    handleChange("sports_interests", updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
      toast.success("CRM details saved successfully");
    } catch (error) {
      toast.error("Failed to save CRM details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex items-center gap-2">
        <Button 
          className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Demographics */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={formData.language.toLowerCase()} 
                  onValueChange={(v) => handleChange("language", v.charAt(0).toUpperCase() + v.slice(1))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="afrikaans">Afrikaans</SelectItem>
                    <SelectItem value="zulu">Zulu</SelectItem>
                    <SelectItem value="xhosa">Xhosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Race</Label>
                <Select 
                  value={formData.race?.toLowerCase() || ""} 
                  onValueChange={(v) => handleChange("race", v.charAt(0).toUpperCase() + v.slice(1))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="african">African</SelectItem>
                    <SelectItem value="coloured">Coloured</SelectItem>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nationality</Label>
                <Select 
                  value={formData.nationality?.toLowerCase().replace(" ", "-") || ""} 
                  onValueChange={(v) => handleChange("nationality", v.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="south-african">South African</SelectItem>
                    <SelectItem value="namibian">Namibian</SelectItem>
                    <SelectItem value="zimbabwean">Zimbabwean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Religion</Label>
                <Select 
                  value={formData.religion?.toLowerCase() || ""} 
                  onValueChange={(v) => handleChange("religion", v.charAt(0).toUpperCase() + v.slice(1))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="christian">Christian</SelectItem>
                    <SelectItem value="muslim">Muslim</SelectItem>
                    <SelectItem value="hindu">Hindu</SelectItem>
                    <SelectItem value="jewish">Jewish</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="smoker" 
                  checked={formData.is_smoker}
                  onCheckedChange={(checked) => handleChange("is_smoker", !!checked)}
                />
                <Label htmlFor="smoker">Is smoker</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="professional" 
                  checked={formData.is_professional}
                  onCheckedChange={(checked) => handleChange("is_professional", !!checked)}
                />
                <Label htmlFor="professional">Is professional person</Label>
              </div>

              <div className="space-y-2">
                <Label>Profession</Label>
                <Select 
                  value={formData.profession?.toLowerCase() || ""} 
                  onValueChange={(v) => handleChange("profession", v.charAt(0).toUpperCase() + v.slice(1))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="attorney">Attorney</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Occupation</Label>
                <Select 
                  value={formData.occupation?.toLowerCase() || ""} 
                  onValueChange={(v) => handleChange("occupation", v.charAt(0).toUpperCase() + v.slice(1))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attorney">Attorney</SelectItem>
                    <SelectItem value="advocate">Advocate</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select 
                  value={formData.industry?.toLowerCase().replace(" ", "-") || ""} 
                  onValueChange={(v) => handleChange("industry", v.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuclear-industry">Nuclear Industry</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Disability type</Label>
                <Select 
                  value={formData.disability_type?.toLowerCase() || ""} 
                  onValueChange={(v) => handleChange("disability_type", v === "none" ? "" : v.charAt(0).toUpperCase() + v.slice(1))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="hearing">Hearing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hybrid" 
                  checked={formData.is_hybrid_client}
                  onCheckedChange={(checked) => handleChange("is_hybrid_client", !!checked)}
                />
                <Label htmlFor="hybrid">Is hybrid client</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Client Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Client preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Preferred contact</Label>
                  <Select 
                    value={formData.preferred_contact?.toLowerCase() || ""} 
                    onValueChange={(v) => handleChange("preferred_contact", v.charAt(0).toUpperCase() + v.slice(1))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred phone</Label>
                  <Select 
                    value={formData.preferred_phone?.toLowerCase() || ""} 
                    onValueChange={(v) => handleChange("preferred_phone", v.charAt(0).toUpperCase() + v.slice(1))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cell">Cell</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred email</Label>
                  <Select 
                    value={formData.preferred_email?.toLowerCase() || ""} 
                    onValueChange={(v) => handleChange("preferred_email", v.charAt(0).toUpperCase() + v.slice(1))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document password</Label>
                  <Button variant="outline" size="sm">Reset to ID</Button>
                </div>

                <div className="space-y-2">
                  <Label>OTP delivery method</Label>
                  <Select 
                    value={formData.otp_delivery_method?.toLowerCase() || "sms"} 
                    onValueChange={(v) => handleChange("otp_delivery_method", v.toUpperCase())}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Subscriptions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Newsletter subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Manage subscriptions</Button>
            </CardContent>
          </Card>

          {/* Alternative Adviser */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Alternative adviser</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Manage alternative advisers</Button>
            </CardContent>
          </Card>

          {/* Team Related Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Team Related details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Employer</p>
                  <p className="font-medium">{client.employer || "-"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wealth Manager</p>
                  <p className="font-medium">{client.wealth_manager || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advisor Related Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Advisor Related details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-muted-foreground">Advisor</p>
                <p className="font-medium">{client.advisor || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sport Interests */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Sport interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {sportsInterests.map((column, colIndex) => (
              <div key={colIndex} className="space-y-3">
                {column.map((sport) => (
                  <div key={sport} className="flex items-center space-x-2">
                    <Checkbox 
                      id={sport.toLowerCase().replace(/\s/g, "-")} 
                      checked={(formData.sports_interests || []).includes(sport)}
                      onCheckedChange={() => handleSportToggle(sport)}
                    />
                    <Label htmlFor={sport.toLowerCase().replace(/\s/g, "-")}>{sport}</Label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCRMTab;
