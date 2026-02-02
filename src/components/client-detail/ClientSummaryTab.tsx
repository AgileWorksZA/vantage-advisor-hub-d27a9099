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

interface ClientSummaryTabProps {
  client: Client;
}

const advisorData = [
  { type: "Primary", advisor: "Jordaan, Danile", relationship: "Owner", rating: "5", role: "Financial Planner" },
  { type: "Secondary", advisor: "Van Zyl, Christo", relationship: "Shared", rating: "4", role: "Investment Advisor" },
];

const productsData = [
  { category: "PSG Trust (Pty) Ltd - Estate", products: [
    { name: "Tax Planning", premium: "R 0.00", frequency: "Monthly", percentage: "100%", value: "R 0.00" },
    { name: "Estate Planning - Will", premium: "R 0.00", frequency: "Monthly", percentage: "100%", value: "R 0.00" },
  ]},
  { category: "Allan Gray - Preservation Fund", products: [
    { name: "Retirement Annuity", premium: "R 2,500.00", frequency: "Monthly", percentage: "100%", value: "R 1,250,000.00" },
  ]},
  { category: "PSG Securities Ltd - Share Portfolio", products: [
    { name: "Local Equities", premium: "R 0.00", frequency: "N/A", percentage: "100%", value: "R 850,000.00" },
  ]},
];

const outstandingDocs = [
  { document: "FICA - Address verification", workflow: "FICA - Individual" },
  { document: "Proof of income", workflow: "Annual Review" },
  { document: "Risk profile questionnaire", workflow: "Advice Cycle" },
];

const ClientSummaryTab = ({ client }: ClientSummaryTabProps) => {
  const displayName = getDisplayName(client);
  const initials = getInitials(client);
  const age = calculateAge(client.date_of_birth);
  const birthday = formatBirthday(client.date_of_birth);

  const totalValue = productsData.reduce((acc, cat) => 
    acc + cat.products.reduce((sum, p) => sum + parseFloat(p.value.replace(/[R\s,]/g, '')), 0), 0
  );

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

        {/* Products */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Premium</TableHead>
                    <TableHead className="text-xs">Frequency</TableHead>
                    <TableHead className="text-xs">%</TableHead>
                    <TableHead className="text-xs text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.map((category, catIndex) => (
                    <>
                      <TableRow key={`cat-${catIndex}`} className="bg-muted/50">
                        <TableCell colSpan={5} className="text-sm font-medium py-2">
                          {category.category}
                        </TableCell>
                      </TableRow>
                      {category.products.map((product, prodIndex) => (
                        <TableRow key={`prod-${catIndex}-${prodIndex}`}>
                          <TableCell className="text-sm pl-6">{product.name}</TableCell>
                          <TableCell className="text-sm">{product.premium}</TableCell>
                          <TableCell className="text-sm">{product.frequency}</TableCell>
                          <TableCell className="text-sm">{product.percentage}</TableCell>
                          <TableCell className="text-sm text-right">{product.value}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                  <TableRow className="bg-muted font-medium">
                    <TableCell colSpan={4} className="text-sm">Total</TableCell>
                    <TableCell className="text-sm text-right">R {totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
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
