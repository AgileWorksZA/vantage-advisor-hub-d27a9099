import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientCRMTabProps {
  client: {
    name: string;
    language: string;
  } | undefined;
}

const sportsInterests = [
  ["Aerobic", "Cricket", "Golf", "Horseriding", "Rugby"],
  ["Boxing", "Cycling", "Gym", "Martial Arts", "Running"],
  ["Chess", "Fishing", "Hiking", "Mountain biking", "Scuba diving"],
];

const ClientCRMTab = ({ client }: ClientCRMTabProps) => {
  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="space-y-6">
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
                <Select defaultValue={client.language.toLowerCase()}>
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
                <Select>
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

              <div className="space-y-2">
                <Label>Religion</Label>
                <Select>
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
                <Checkbox id="smoker" />
                <Label htmlFor="smoker">Is smoker</Label>
              </div>

              <div className="space-y-2">
                <Label>Education</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matric">Matric</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="postgrad">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="professional" />
                <Label htmlFor="professional">Is professional person</Label>
              </div>

              <div className="space-y-2">
                <Label>Profession</Label>
                <Select>
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
                <Select defaultValue="attorney">
                  <SelectTrigger>
                    <SelectValue />
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
                <Select defaultValue="nuclear">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuclear">Nuclear Industry</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Disability type</Label>
                <Select>
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
                <Checkbox id="hybrid" defaultChecked />
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
                  <Select>
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
                  <Select>
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
                  <Select>
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
                  <Label>Preferred social media</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document password</Label>
                  <Button variant="outline" size="sm">Reset to ID</Button>
                </div>

                <div className="space-y-2">
                  <Label>OTP delivery method</Label>
                  <Select defaultValue="sms">
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
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">Danile Jordaan Financial Planning LTD</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Family name</p>
                  <p className="font-medium">BothamaJOB79</p>
                </div>
                <Button size="sm" className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white">
                  Create
                </Button>
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
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">Jordaan, Danile</p>
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
                    <Checkbox id={sport.toLowerCase().replace(/\s/g, "-")} />
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
