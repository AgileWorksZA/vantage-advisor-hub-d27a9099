import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Phone, Mail, Download, Save } from "lucide-react";
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

interface ClientDetailsTabProps {
  client: {
    name: string;
    title: string;
    initials: string;
    personType: string;
    idNumber: string;
    countryOfIssue: string;
    gender: string;
    age: number;
    birthday: string;
    cellNumber: string;
    email: string;
    workNumber: string;
    homeNumber: string;
  } | undefined;
}

const ClientDetailsTab = ({ client }: ClientDetailsTabProps) => {
  if (!client) {
    return <div>Client not found</div>;
  }

  const nameParts = client.name.split(", ");
  const surname = nameParts[0] || "";
  const firstNames = nameParts[1]?.replace(/\(.*\)/, "").trim() || "";
  const preferredName = client.name.match(/\((.*?)\)/)?.[1] || "";

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2">
            <Save className="w-4 h-4" />
            Save changes
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download contact
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Identification Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Identification details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input defaultValue={client.name} />
                </div>

                <div className="space-y-2">
                  <Label>Person type</Label>
                  <Select defaultValue={client.personType.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input defaultValue={client.idNumber} />
                </div>

                <div className="space-y-2">
                  <Label>Country of issue</Label>
                  <Select defaultValue="south-africa">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="south-africa">South Africa</SelectItem>
                      <SelectItem value="namibia">Namibia</SelectItem>
                      <SelectItem value="botswana">Botswana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select defaultValue={client.gender.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Select defaultValue={client.title.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="dr">Dr</SelectItem>
                      <SelectItem value="adv">Adv</SelectItem>
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
                  <Input defaultValue={client.initials} />
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
                  <Input defaultValue={firstNames} />
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
                  <Input defaultValue={surname} />
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
                  <Input defaultValue={preferredName} />
                </div>

                <div className="space-y-2">
                  <Label>Birthday</Label>
                  <Input defaultValue={client.birthday} type="text" />
                </div>

                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input defaultValue={client.age.toString()} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Passport number</Label>
                  <Input placeholder="Enter passport number" />
                </div>

                <div className="space-y-2">
                  <Label>Passport issued date</Label>
                  <Input type="date" />
                </div>

                <div className="space-y-2">
                  <Label>Passport expiry date</Label>
                  <Input type="date" />
                </div>

                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Select defaultValue="south-african">
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
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Contact Details */}
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
                  <Input defaultValue={client.homeNumber} />
                </div>

                <div className="space-y-2">
                  <Label>Work number</Label>
                  <Input defaultValue={client.workNumber} />
                </div>

                <div className="space-y-2">
                  <Label>Work extension</Label>
                  <Input placeholder="Extension" />
                </div>

                <div className="space-y-2">
                  <Label>Work number secondary</Label>
                  <Input placeholder="Secondary work number" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Cell number
                    <Phone className="w-3 h-3 text-muted-foreground" />
                  </Label>
                  <Input defaultValue={client.cellNumber} />
                </div>

                <div className="space-y-2">
                  <Label>Cell number secondary</Label>
                  <Input placeholder="Secondary cell number" />
                </div>

                <div className="space-y-2">
                  <Label>Fax number</Label>
                  <Input placeholder="Fax number" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Email
                    <Mail className="w-3 h-3 text-muted-foreground" />
                  </Label>
                  <Input defaultValue={client.email} type="email" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Work email
                    <Mail className="w-3 h-3 text-muted-foreground" />
                  </Label>
                  <Input placeholder="Work email address" type="email" />
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input placeholder="https://" type="url" />
                </div>

                <div className="space-y-2">
                  <Label>Skype</Label>
                  <Input placeholder="Skype username" />
                </div>

                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input placeholder="Facebook profile URL" />
                </div>

                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input placeholder="LinkedIn profile URL" />
                </div>

                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input placeholder="Twitter handle" />
                </div>

                <div className="space-y-2">
                  <Label>YouTube</Label>
                  <Input placeholder="YouTube channel URL" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ClientDetailsTab;
