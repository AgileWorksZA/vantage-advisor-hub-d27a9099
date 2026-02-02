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
    // DB constraint: Email, Phone, SMS, Post
    preferred_contact: client.preferred_contact || "",
    // DB constraint: Cell, Work, Home
    preferred_phone: client.preferred_phone || "",
    // DB constraint: Personal, Work
    preferred_email: client.preferred_email || "",
    // DB constraint: SMS, Email
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
      // Only include fields that have values to avoid constraint violations
      const updates: Partial<Client> = {
        language: formData.language || null,
        race: formData.race || null,
        nationality: formData.nationality || null,
        religion: formData.religion || null,
        is_smoker: formData.is_smoker,
        is_professional: formData.is_professional,
        is_hybrid_client: formData.is_hybrid_client,
        profession: formData.profession || null,
        occupation: formData.occupation || null,
        industry: formData.industry || null,
        disability_type: formData.disability_type || null,
        sports_interests: formData.sports_interests.length > 0 ? formData.sports_interests : null,
      };

      // Only include preference fields if they have valid values (match DB constraints)
      if (formData.preferred_contact && ["Email", "Phone", "SMS", "Post"].includes(formData.preferred_contact)) {
        updates.preferred_contact = formData.preferred_contact;
      } else {
        updates.preferred_contact = null;
      }

      if (formData.preferred_phone && ["Cell", "Work", "Home"].includes(formData.preferred_phone)) {
        updates.preferred_phone = formData.preferred_phone;
      } else {
        updates.preferred_phone = null;
      }

      if (formData.preferred_email && ["Personal", "Work"].includes(formData.preferred_email)) {
        updates.preferred_email = formData.preferred_email;
      } else {
        updates.preferred_email = null;
      }

      if (formData.otp_delivery_method && ["SMS", "Email"].includes(formData.otp_delivery_method)) {
        updates.otp_delivery_method = formData.otp_delivery_method;
      } else {
        updates.otp_delivery_method = "SMS";
      }

      await onUpdate(updates);
      toast.success("CRM details saved successfully");
    } catch (error) {
      console.error("Save error:", error);
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
                  value={formData.language || ""} 
                  onValueChange={(v) => handleChange("language", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                    <SelectItem value="Zulu">Zulu</SelectItem>
                    <SelectItem value="Xhosa">Xhosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Race</Label>
                <Select 
                  value={formData.race || ""} 
                  onValueChange={(v) => handleChange("race", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="African">African</SelectItem>
                    <SelectItem value="Coloured">Coloured</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nationality</Label>
                <Select 
                  value={formData.nationality || ""} 
                  onValueChange={(v) => handleChange("nationality", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="South African">South African</SelectItem>
                    <SelectItem value="Namibian">Namibian</SelectItem>
                    <SelectItem value="Zimbabwean">Zimbabwean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Religion</Label>
                <Select 
                  value={formData.religion || ""} 
                  onValueChange={(v) => handleChange("religion", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Christian">Christian</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Jewish">Jewish</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="None">None</SelectItem>
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
                  value={formData.profession || ""} 
                  onValueChange={(v) => handleChange("profession", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Attorney">Attorney</SelectItem>
                    <SelectItem value="Doctor">Doctor</SelectItem>
                    <SelectItem value="Engineer">Engineer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Occupation</Label>
                <Select 
                  value={formData.occupation || ""} 
                  onValueChange={(v) => handleChange("occupation", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Attorney">Attorney</SelectItem>
                    <SelectItem value="Advocate">Advocate</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select 
                  value={formData.industry || ""} 
                  onValueChange={(v) => handleChange("industry", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nuclear Industry">Nuclear Industry</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Disability type</Label>
                <Select 
                  value={formData.disability_type || ""} 
                  onValueChange={(v) => handleChange("disability_type", v === "None" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Visual">Visual</SelectItem>
                    <SelectItem value="Hearing">Hearing</SelectItem>
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
                    value={formData.preferred_contact || ""} 
                    onValueChange={(v) => handleChange("preferred_contact", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Post">Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred phone</Label>
                  <Select 
                    value={formData.preferred_phone || ""} 
                    onValueChange={(v) => handleChange("preferred_phone", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cell">Cell</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred email</Label>
                  <Select 
                    value={formData.preferred_email || ""} 
                    onValueChange={(v) => handleChange("preferred_email", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
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
                    value={formData.otp_delivery_method || "SMS"} 
                    onValueChange={(v) => handleChange("otp_delivery_method", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
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
