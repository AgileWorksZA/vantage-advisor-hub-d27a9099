import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Info, Phone, Mail, Download, Save } from "lucide-react";
import { extractDateOfBirthFromId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Client } from "@/types/client";
import { toast } from "sonner";

interface ClientDetailsTabProps {
  client: Client;
  onUpdate: (updates: Partial<Client>) => Promise<boolean | undefined>;
}

const sportsInterests = [
  ["Aerobic", "Cricket", "Golf", "Horseriding", "Rugby"],
  ["Boxing", "Cycling", "Gym", "Martial Arts", "Running"],
  ["Chess", "Fishing", "Hiking", "Mountain biking", "Scuba diving"],
];

const ClientDetailsTab = ({ client, onUpdate }: ClientDetailsTabProps) => {
  const [formData, setFormData] = useState({
    title: client.title || "",
    first_name: client.first_name,
    surname: client.surname,
    initials: client.initials || "",
    preferred_name: client.preferred_name || "",
    person_type: client.person_type || "Individual",
    id_number: client.id_number || "",
    passport_number: client.passport_number || "",
    country_of_issue: client.country_of_issue || "South Africa",
    gender: client.gender || "",
    date_of_birth: client.date_of_birth || "",
    nationality: client.nationality || "South African",
    home_number: client.home_number || "",
    work_number: client.work_number || "",
    work_extension: client.work_extension || "",
    cell_number: client.cell_number || "",
    fax_number: client.fax_number || "",
    email: client.email || "",
    work_email: client.work_email || "",
    website: client.website || "",
    skype: client.skype || "",
    facebook: client.facebook || "",
    linkedin: client.linkedin || "",
    twitter: client.twitter || "",
    youtube: client.youtube || "",
    // CRM fields
    language: client.language || "English",
    race: client.race || "",
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

  useEffect(() => {
    setFormData({
      title: client.title || "",
      first_name: client.first_name,
      surname: client.surname,
      initials: client.initials || "",
      preferred_name: client.preferred_name || "",
      person_type: client.person_type || "Individual",
      id_number: client.id_number || "",
      passport_number: client.passport_number || "",
      country_of_issue: client.country_of_issue || "South Africa",
      gender: client.gender || "",
      date_of_birth: client.date_of_birth || "",
      nationality: client.nationality || "South African",
      home_number: client.home_number || "",
      work_number: client.work_number || "",
      work_extension: client.work_extension || "",
      cell_number: client.cell_number || "",
      fax_number: client.fax_number || "",
      email: client.email || "",
      work_email: client.work_email || "",
      website: client.website || "",
      skype: client.skype || "",
      facebook: client.facebook || "",
      linkedin: client.linkedin || "",
      twitter: client.twitter || "",
      youtube: client.youtube || "",
      language: client.language || "English",
      race: client.race || "",
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
  }, [client]);

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === "id_number" && prev.person_type === "Individual" && typeof value === "string" && value.length >= 6) {
        const extractedDob = extractDateOfBirthFromId(value);
        if (extractedDob) {
          updated.date_of_birth = extractedDob;
        }
      }
      
      return updated;
    });
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
      const updates: Partial<Client> = {
        title: formData.title || null,
        first_name: formData.first_name,
        surname: formData.surname,
        initials: formData.initials || null,
        preferred_name: formData.preferred_name || null,
        person_type: formData.person_type || "Individual",
        id_number: formData.id_number || null,
        passport_number: formData.passport_number || null,
        country_of_issue: formData.country_of_issue || null,
        date_of_birth: formData.date_of_birth || null,
        nationality: formData.nationality || null,
        home_number: formData.home_number || null,
        work_number: formData.work_number || null,
        work_extension: formData.work_extension || null,
        cell_number: formData.cell_number || null,
        fax_number: formData.fax_number || null,
        email: formData.email || null,
        work_email: formData.work_email || null,
        website: formData.website || null,
        skype: formData.skype || null,
        facebook: formData.facebook || null,
        linkedin: formData.linkedin || null,
        twitter: formData.twitter || null,
        youtube: formData.youtube || null,
        // CRM fields
        language: formData.language || null,
        race: formData.race || null,
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

      // Gender constraint
      if (formData.gender && ["Male", "Female", "Other"].includes(formData.gender)) {
        updates.gender = formData.gender;
      } else {
        updates.gender = null;
      }

      // CRM preference constraints
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
      toast.success("Client details saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save client details");
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download contact
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Identification Details */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Identification details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Person type</Label>
                    <Select 
                      value={formData.person_type || "Individual"} 
                      onValueChange={(v) => handleChange("person_type", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Trust">Trust</SelectItem>
                        <SelectItem value="Company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>ID Number</Label>
                    <Input 
                      value={formData.id_number} 
                      onChange={(e) => handleChange("id_number", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Passport Number</Label>
                    <Input 
                      value={formData.passport_number} 
                      onChange={(e) => handleChange("passport_number", e.target.value)}
                      placeholder="Enter passport number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Country of issue</Label>
                    <Select 
                      value={formData.country_of_issue || "South Africa"} 
                      onValueChange={(v) => handleChange("country_of_issue", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Namibia">Namibia</SelectItem>
                        <SelectItem value="Botswana">Botswana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select 
                      value={formData.gender || ""} 
                      onValueChange={(v) => handleChange("gender", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Select 
                      value={formData.title || ""} 
                      onValueChange={(v) => handleChange("title", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Adv">Adv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label>Initials</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter client's initials</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      value={formData.initials} 
                      onChange={(e) => handleChange("initials", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label>First names</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter all first names</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      value={formData.first_name} 
                      onChange={(e) => handleChange("first_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label>Surnames</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter surname(s)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      value={formData.surname} 
                      onChange={(e) => handleChange("surname", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label>Preferred name</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The name the client prefers to be called</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      value={formData.preferred_name} 
                      onChange={(e) => handleChange("preferred_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date" 
                      value={formData.date_of_birth} 
                      onChange={(e) => handleChange("date_of_birth", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input value={calculateAge(formData.date_of_birth)} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Select 
                      value={formData.nationality || ""} 
                      onValueChange={(v) => handleChange("nationality", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="South African">South African</SelectItem>
                        <SelectItem value="Namibian">Namibian</SelectItem>
                        <SelectItem value="Zimbabwean">Zimbabwean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={formData.language || ""} onValueChange={(v) => handleChange("language", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Select value={formData.race || ""} onValueChange={(v) => handleChange("race", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Label>Religion</Label>
                    <Select value={formData.religion || ""} onValueChange={(v) => handleChange("religion", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Checkbox id="smoker" checked={formData.is_smoker} onCheckedChange={(checked) => handleChange("is_smoker", !!checked)} />
                    <Label htmlFor="smoker">Is smoker</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="professional" checked={formData.is_professional} onCheckedChange={(checked) => handleChange("is_professional", !!checked)} />
                    <Label htmlFor="professional">Is professional person</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Profession</Label>
                    <Select value={formData.profession || ""} onValueChange={(v) => handleChange("profession", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Select value={formData.occupation || ""} onValueChange={(v) => handleChange("occupation", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Select value={formData.industry || ""} onValueChange={(v) => handleChange("industry", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Select value={formData.disability_type || ""} onValueChange={(v) => handleChange("disability_type", v === "None" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Physical">Physical</SelectItem>
                        <SelectItem value="Visual">Visual</SelectItem>
                        <SelectItem value="Hearing">Hearing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="hybrid" checked={formData.is_hybrid_client} onCheckedChange={(checked) => handleChange("is_hybrid_client", !!checked)} />
                    <Label htmlFor="hybrid">Is hybrid client</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Contact details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Please enter phone numbers in international format (e.g., +27 21 555 1234)
                </p>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Home number</Label>
                    <Input value={formData.home_number} onChange={(e) => handleChange("home_number", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Work number</Label>
                    <Input value={formData.work_number} onChange={(e) => handleChange("work_number", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Work extension</Label>
                    <Input value={formData.work_extension} onChange={(e) => handleChange("work_extension", e.target.value)} placeholder="Extension" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Cell number <Phone className="w-3 h-3 text-muted-foreground" /></Label>
                    <Input value={formData.cell_number} onChange={(e) => handleChange("cell_number", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fax number</Label>
                    <Input value={formData.fax_number} onChange={(e) => handleChange("fax_number", e.target.value)} placeholder="Fax number" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Email <Mail className="w-3 h-3 text-muted-foreground" /></Label>
                    <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Work email <Mail className="w-3 h-3 text-muted-foreground" /></Label>
                    <Input value={formData.work_email} onChange={(e) => handleChange("work_email", e.target.value)} placeholder="Work email address" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={formData.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://" type="url" />
                  </div>
                  <div className="space-y-2">
                    <Label>Skype</Label>
                    <Input value={formData.skype} onChange={(e) => handleChange("skype", e.target.value)} placeholder="Skype username" />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input value={formData.facebook} onChange={(e) => handleChange("facebook", e.target.value)} placeholder="Facebook profile URL" />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input value={formData.linkedin} onChange={(e) => handleChange("linkedin", e.target.value)} placeholder="LinkedIn profile URL" />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter</Label>
                    <Input value={formData.twitter} onChange={(e) => handleChange("twitter", e.target.value)} placeholder="Twitter handle" />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input value={formData.youtube} onChange={(e) => handleChange("youtube", e.target.value)} placeholder="YouTube channel URL" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Preferences */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Client preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Preferred contact</Label>
                    <Select value={formData.preferred_contact || ""} onValueChange={(v) => handleChange("preferred_contact", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Select value={formData.preferred_phone || ""} onValueChange={(v) => handleChange("preferred_phone", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cell">Cell</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred email</Label>
                    <Select value={formData.preferred_email || ""} onValueChange={(v) => handleChange("preferred_email", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <Select value={formData.otp_delivery_method || "SMS"} onValueChange={(v) => handleChange("otp_delivery_method", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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

        {/* Sport Interests - Full Width */}
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
    </TooltipProvider>
  );
};

export default ClientDetailsTab;
