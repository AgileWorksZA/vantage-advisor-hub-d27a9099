import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DuplicateClientDialog from "./DuplicateClientDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const clientSchema = z.object({
  // Profile
  profile_type: z.enum(["Lead", "Prospect", "Client"]),
  client_type: z.enum(["individual", "family", "business"]),
  
  // Identification
  title: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  initials: z.string().optional(),
  id_number: z.string().min(1, "Identification number is required"),
  country_of_issue: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  date_of_birth: z.string().optional(),
  language: z.string().optional(),
  tax_number: z.string().optional(),
  
  // Contact
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  cell_number: z.string().optional(),
  work_number: z.string().optional(),
  home_number: z.string().optional(),
  
  // Professional
  occupation: z.string().optional(),
  employer: z.string().optional(),
  
  // Assignment
  advisor: z.string().optional(),
  wealth_manager: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded: () => void;
  onClientCreated?: (client: { id: string; name: string }) => void;
}

const AddClientDialog = ({ open, onOpenChange, onClientAdded, onClientCreated }: AddClientDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateClient, setDuplicateClient] = useState<{
    id: string;
    name: string;
    idNumber: string;
  } | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ClientFormData | null>(null);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      profile_type: "Prospect",
      client_type: "individual",
      title: "",
      first_name: "",
      surname: "",
      initials: "",
      id_number: "",
      country_of_issue: "South Africa",
      language: "English",
      email: "",
      cell_number: "",
      work_number: "",
      home_number: "",
      occupation: "",
      employer: "",
      advisor: "",
      wealth_manager: "",
    },
  });

  // Check for duplicate ID number before submission
  const checkDuplicateIdNumber = async (idNumber: string) => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, first_name, surname, id_number")
      .ilike("id_number", idNumber)
      .limit(1);

    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  };

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add a client");
        return;
      }

      // Check for duplicate ID number
      const existingClient = await checkDuplicateIdNumber(data.id_number);
      if (existingClient) {
        setDuplicateClient({
          id: existingClient.id,
          name: `${existingClient.surname}, ${existingClient.first_name}`,
          idNumber: existingClient.id_number || "",
        });
        setPendingFormData(data);
        setShowDuplicateDialog(true);
        setIsSubmitting(false);
        return;
      }

      // Parse date of birth if provided
      let dateOfBirth = null;
      if (data.date_of_birth) {
        dateOfBirth = data.date_of_birth;
      }

      const { data: newClient, error } = await supabase.from("clients").insert({
        user_id: user.id,
        profile_state: "Active",
        profile_type: data.profile_type,
        client_type: data.client_type,
        title: data.title || null,
        first_name: data.first_name,
        surname: data.surname,
        initials: data.initials || null,
        id_number: data.id_number || null,
        country_of_issue: data.country_of_issue || "South Africa",
        gender: data.gender || null,
        date_of_birth: dateOfBirth,
        language: data.language || "English",
        tax_number: data.tax_number || null,
        email: data.email || null,
        cell_number: data.cell_number || null,
        work_number: data.work_number || null,
        home_number: data.home_number || null,
        occupation: data.occupation || null,
        employer: data.employer || null,
        advisor: data.advisor || null,
        wealth_manager: data.wealth_manager || null,
      }).select().single();

      if (error) throw error;

      toast.success("Client added successfully");
      form.reset();
      onOpenChange(false);
      onClientAdded();
      
      // Call new callback if provided with client data
      if (onClientCreated && newClient) {
        onClientCreated({
          id: newClient.id,
          name: `${newClient.first_name} ${newClient.surname}`,
        });
      }
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast.error(error.message || "Failed to add client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="profile_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Prospect">Prospect</SelectItem>
                            <SelectItem value="Client">Client</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                            <SelectItem value="Dr">Dr</SelectItem>
                            <SelectItem value="Prof">Prof</SelectItem>
                            <SelectItem value="Adv">Adv</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Surname *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="initials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initials</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country_of_issue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Issue</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                            <SelectItem value="Zulu">Zulu</SelectItem>
                            <SelectItem value="Xhosa">Xhosa</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tax_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cell_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cell Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+27..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="work_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+27..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="home_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+27..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="advisor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advisor</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wealth_manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wealth Manager</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
              >
                {isSubmitting ? "Adding..." : "Add Client"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <DuplicateClientDialog
      open={showDuplicateDialog}
      onOpenChange={setShowDuplicateDialog}
      existingClient={duplicateClient}
      onCancel={() => {
        setShowDuplicateDialog(false);
        setDuplicateClient(null);
        setPendingFormData(null);
      }}
      onCloseParentDialog={() => onOpenChange(false)}
    />
  </>
  );
};

export default AddClientDialog;
