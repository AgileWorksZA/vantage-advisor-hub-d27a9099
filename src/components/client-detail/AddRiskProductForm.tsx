import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
}

const AddRiskProductForm = ({ onClose, onSave }: AddRiskProductFormProps) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("");

  const form = useForm<RiskProductFormValues>({
    resolver: zodResolver(riskProductSchema),
    defaultValues: {
      productProvider: "",
      productName: "",
      totalPremium: "0.00",
      premiumFrequency: "",
      policyNumber: "",
      policyActive: "No",
      notes: "",
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
      <div>
        <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-[hsl(180,70%,45%)] rounded">
          Risk Product Details
        </span>
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
              <p className="text-sm text-muted-foreground text-center py-4">No items found</p>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Form>
    </div>
  );
};

export default AddRiskProductForm;
