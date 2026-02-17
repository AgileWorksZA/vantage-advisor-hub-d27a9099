import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronUp, Search, Upload, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { RiskProduct } from "@/data/regional360ViewData";

const riskProductSchema = z.object({
  productProvider: z.string().min(1, "Product provider is required"),
  productName: z.string().min(1, "Product name is required"),
  totalPremium: z.string().default("0.00"),
  premiumFrequency: z.string().optional(),
  policyNumber: z.string().min(1, "Policy number is required"),
  paymentDueDate: z.date().optional(),
  effectiveDate: z.date({ required_error: "Effective date is required" }),
  terminationDate: z.date().optional(),
  dataDate: z.date().optional(),
  policyActive: z.enum(["Yes", "No"]).default("No"),
  notes: z.string().optional(),
});

type RiskProductFormValues = z.infer<typeof riskProductSchema>;

interface AddRiskProductFormProps {
  onClose: () => void;
  onSave: (data: RiskProductFormValues) => void;
  initialData?: RiskProduct;
}

const tryParseDate = (dateStr: string | undefined): Date | undefined => {
  if (!dateStr) return undefined;
  const formats = ["yyyy/MM/dd", "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"];
  for (const fmt of formats) {
    try {
      const d = parse(dateStr, fmt, new Date());
      if (!isNaN(d.getTime())) return d;
    } catch { /* skip */ }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
};

const stripCurrency = (val: string | undefined): string => {
  if (!val) return "0.00";
  return val.replace(/[^0-9.-]/g, "") || "0.00";
};

const demoParticipants = [
  { role: "Planholder", fullName: "John Smith", idNumber: "8501015800087", gender: "Male", dob: "1985/01/01", percentage: "100%", smoking: "Non-smoker", marital: "Married", occupation: "Engineer" },
  { role: "Beneficiary", fullName: "Sarah Smith", idNumber: "8705125800081", gender: "Female", dob: "1987/05/12", percentage: "50%", smoking: "Non-smoker", marital: "Married", occupation: "Teacher" },
  { role: "Insured", fullName: "John Smith", idNumber: "8501015800087", gender: "Male", dob: "1985/01/01", percentage: "100%", smoking: "Non-smoker", marital: "Married", occupation: "Engineer" },
];

const AddRiskProductForm = ({ onClose, onSave, initialData }: AddRiskProductFormProps) => {
  const [historyOpen, setHistoryOpen] = useState(!!initialData);
  const [historyFilter, setHistoryFilter] = useState("");
  const [planDetailsOpen, setPlanDetailsOpen] = useState(!!initialData);

  const form = useForm<RiskProductFormValues>({
    resolver: zodResolver(riskProductSchema),
    defaultValues: {
      productProvider: initialData?.holdingName || "",
      productName: initialData?.holdingName || "",
      totalPremium: initialData ? stripCurrency(initialData.paymentAmount) : "0.00",
      premiumFrequency: "",
      policyNumber: initialData?.policyNumber || "",
      policyActive: "No",
      notes: initialData?.notes || "",
      effectiveDate: initialData ? tryParseDate(initialData.effectiveDate) : undefined,
      terminationDate: initialData ? tryParseDate(initialData.terminationDate) : undefined,
      paymentDueDate: initialData ? tryParseDate(initialData.paymentDueDate) : undefined,
      dataDate: initialData ? new Date() : undefined,
    },
  });

  const onSubmit = (data: RiskProductFormValues) => {
    onSave(data);
    toast({ title: "Risk Product saved", description: "The risk product has been added successfully." });
  };

  const YesNoRadio = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <RadioGroup value={value} onValueChange={onChange} className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <RadioGroupItem value="Yes" id={`yes-${Math.random()}`} />
        <Label className="font-normal text-sm">Yes</Label>
      </div>
      <div className="flex items-center gap-1.5">
        <RadioGroupItem value="No" id={`no-${Math.random()}`} />
        <Label className="font-normal text-sm">No</Label>
      </div>
    </RadioGroup>
  );

  const DatePickerField = ({ field }: { field: any }) => (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
          >
            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-[hsl(180,70%,45%)] rounded">
          Risk Product Details
        </span>
        {initialData && (
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-white bg-purple-600 rounded">
            Astute
          </span>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <FormField control={form.control} name="productProvider" render={({ field }) => (
              <FormItem>
                <FormLabel>Product Provider <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="productName" render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="totalPremium" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Premium</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="premiumFrequency" render={({ field }) => (
              <FormItem>
                <FormLabel>Premium Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="policyNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Policy number <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="paymentDueDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment due date</FormLabel>
                <DatePickerField field={field} />
              </FormItem>
            )} />

            <FormField control={form.control} name="effectiveDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Effective date <span className="text-destructive">*</span></FormLabel>
                <DatePickerField field={field} />
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="terminationDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Termination date</FormLabel>
                <DatePickerField field={field} />
              </FormItem>
            )} />

            <FormField control={form.control} name="dataDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Data date</FormLabel>
                <DatePickerField field={field} />
              </FormItem>
            )} />

            <FormField control={form.control} name="policyActive" render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Active</FormLabel>
                <FormControl>
                  <YesNoRadio value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl><Textarea rows={3} {...field} /></FormControl>
            </FormItem>
          )} />

          {/* Plan Details & Participants - only when viewing existing product */}
          {initialData && (
            <Collapsible open={planDetailsOpen} onOpenChange={setPlanDetailsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-t border-b">
                <span className="text-sm font-medium">Plan Details & Participants</span>
                {planDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="py-4 space-y-6">
                {/* Plan details fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Plan Name</Label>
                    <p className="text-sm font-medium mt-0.5">{initialData.holdingName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cover Amount</Label>
                    <p className="text-sm font-medium mt-0.5">{initialData.paymentAmount}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Premium Amount</Label>
                    <p className="text-sm font-medium mt-0.5">{initialData.paymentAmount}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Effective Date</Label>
                    <p className="text-sm font-medium mt-0.5">{initialData.effectiveDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Termination Date</Label>
                    <p className="text-sm font-medium mt-0.5">{initialData.terminationDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Life Cover Status</Label>
                    <p className="text-sm font-medium mt-0.5">Active</p>
                  </div>
                </div>

                {/* Participants table */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Participants / Related Parties</h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs font-medium text-muted-foreground">Role</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Full Name</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">ID Number</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Gender</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Date of Birth</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Percentage</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Smoking</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Marital Status</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Occupation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demoParticipants.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm font-medium">{p.role}</TableCell>
                          <TableCell className="text-sm">{p.fullName}</TableCell>
                          <TableCell className="text-sm">{p.idNumber}</TableCell>
                          <TableCell className="text-sm">{p.gender}</TableCell>
                          <TableCell className="text-sm">{p.dob}</TableCell>
                          <TableCell className="text-sm">{p.percentage}</TableCell>
                          <TableCell className="text-sm">{p.smoking}</TableCell>
                          <TableCell className="text-sm">{p.marital}</TableCell>
                          <TableCell className="text-sm">{p.occupation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Documents Section */}
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-medium text-muted-foreground">Document Name</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Document Title</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Document Category</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Upload date</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Archived</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Manage upload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-sm">No documents uploaded</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Upload</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white">Save</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>

          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-t border-b">
              <span className="text-sm font-medium">Product History</span>
              {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="py-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filter..." value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="pl-8 h-9" />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9"><Printer className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9"><Download className="h-4 w-4" /></Button>
              </div>
              {initialData ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground">Description</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground">Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">{format(new Date(), "PPP")}</TableCell>
                      <TableCell className="text-sm">Data retrieved from Astute</TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold text-white bg-purple-600 rounded">Astute</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No items found</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Form>
    </div>
  );
};

export default AddRiskProductForm;
