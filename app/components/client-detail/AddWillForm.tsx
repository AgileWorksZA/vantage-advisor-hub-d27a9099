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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const willSchema = z.object({
  clientHasWill: z.enum(["Yes", "No"]).default("No"),
  efwReceiptNumber: z.string().optional(),
  placeKept: z.string().min(1, "Place kept is required"),
  executors: z.string().optional(),
  dateOfWill: z.date({ required_error: "Date of will is required" }),
  lastReviewDate: z.date().optional(),
  notes: z.string().optional(),
});

type WillFormValues = z.infer<typeof willSchema>;

interface AddWillFormProps {
  onClose: () => void;
  onSave: (data: WillFormValues) => void;
}

const AddWillForm = ({ onClose, onSave }: AddWillFormProps) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("");

  const form = useForm<WillFormValues>({
    resolver: zodResolver(willSchema),
    defaultValues: {
      clientHasWill: "No",
      efwReceiptNumber: "",
      placeKept: "",
      executors: "",
      notes: "",
    },
  });

  const onSubmit = (data: WillFormValues) => {
    onSave(data);
    toast({ title: "Will saved", description: "The will has been added successfully." });
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
          Will Details
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <FormField control={form.control} name="clientHasWill" render={({ field }) => (
              <FormItem>
                <FormLabel>Client has will</FormLabel>
                <FormControl>
                  <YesNoRadio value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="efwReceiptNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>EFW receipt number</FormLabel>
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="placeKept" render={({ field }) => (
              <FormItem>
                <FormLabel>Place kept <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="executors" render={({ field }) => (
              <FormItem>
                <FormLabel>Executors</FormLabel>
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="dateOfWill" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of will <span className="text-destructive">*</span></FormLabel>
                <DatePickerField field={field} />
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="lastReviewDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Last review date</FormLabel>
                <DatePickerField field={field} />
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

export default AddWillForm;
