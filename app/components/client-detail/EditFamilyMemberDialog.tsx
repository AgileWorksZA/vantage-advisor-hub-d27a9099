import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2 } from "lucide-react";
import { FamilyMemberListItem } from "@/hooks/useClientRelationships";

const editFamilyMemberSchema = z.object({
  // Relationship Details
  relationship_type: z.enum(["Spouse", "Child", "Parent", "Sibling"]),
  family_type: z.string().optional(),
  show_on_birthday_list: z.boolean().optional(),
  send_birthday_sms: z.boolean().optional(),
  
  // Communication Options
  cc_pfrs: z.boolean().optional(),
  cc_email_communications: z.boolean().optional(),
  
  // Viewing Access
  product_viewing_level: z.string().optional(),
  
  // Identification Details
  person_type: z.string().optional(),
  id_number: z.string().optional(),
  country_of_issue: z.string().optional(),
  gender: z.string().optional(),
  title: z.string().optional(),
  initials: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  preferred_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  
  // Contact Details
  home_number: z.string().optional(),
  work_number: z.string().optional(),
  work_extension: z.string().optional(),
  cell_number: z.string().optional(),
  fax_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  work_email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  twitter: z.string().optional(),
  skype: z.string().optional(),
  youtube: z.string().optional(),
  
  // Residential Address
  res_address_type: z.string().optional(),
  res_unit_nr: z.string().optional(),
  res_floor: z.string().optional(),
  res_building: z.string().optional(),
  res_farm: z.string().optional(),
  res_street_nr: z.string().optional(),
  res_street: z.string().optional(),
  res_development: z.string().optional(),
  res_city: z.string().optional(),
  res_suburb: z.string().optional(),
  res_code: z.string().optional(),
  res_province: z.string().optional(),
  res_country: z.string().optional(),
  res_gps_lat: z.string().optional(),
  res_gps_long: z.string().optional(),
  
  // Postal Address
  postal_address_type: z.string().optional(),
  postal_attention: z.string().optional(),
  postal_po_box: z.string().optional(),
  postal_city: z.string().optional(),
  postal_suburb: z.string().optional(),
  postal_code: z.string().optional(),
});

type EditFamilyMemberFormData = z.infer<typeof editFamilyMemberSchema>;

interface EditFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  familyMember: FamilyMemberListItem | null;
  onSuccess: () => void;
}

interface ResidentialAddress {
  type?: string;
  unit_nr?: string;
  floor?: string;
  building?: string;
  farm?: string;
  street_nr?: string;
  street?: string;
  development?: string;
  city?: string;
  suburb?: string;
  code?: string;
  province?: string;
  country?: string;
  gps_lat?: string;
  gps_long?: string;
}

interface PostalAddress {
  type?: string;
  attention?: string;
  po_box?: string;
  city?: string;
  suburb?: string;
  code?: string;
}

const EditFamilyMemberDialog = ({ 
  open, 
  onOpenChange, 
  clientId, 
  familyMember, 
  onSuccess 
}: EditFamilyMemberDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  const form = useForm<EditFamilyMemberFormData>({
    resolver: zodResolver(editFamilyMemberSchema),
    defaultValues: {
      relationship_type: "Spouse",
      family_type: "",
      show_on_birthday_list: false,
      send_birthday_sms: false,
      cc_pfrs: false,
      cc_email_communications: false,
      product_viewing_level: "Full",
      person_type: "Individual",
      id_number: "",
      country_of_issue: "South Africa",
      gender: "",
      title: "",
      initials: "",
      first_name: "",
      surname: "",
      preferred_name: "",
      date_of_birth: "",
      home_number: "",
      work_number: "",
      work_extension: "",
      cell_number: "",
      fax_number: "",
      email: "",
      work_email: "",
      website: "",
      twitter: "",
      skype: "",
      youtube: "",
      res_address_type: "Physical",
      res_unit_nr: "",
      res_floor: "",
      res_building: "",
      res_farm: "",
      res_street_nr: "",
      res_street: "",
      res_development: "",
      res_city: "",
      res_suburb: "",
      res_code: "",
      res_province: "",
      res_country: "South Africa",
      res_gps_lat: "",
      res_gps_long: "",
      postal_address_type: "P.O. Box",
      postal_attention: "",
      postal_po_box: "",
      postal_city: "",
      postal_suburb: "",
      postal_code: "",
    },
  });

  // Load data when dialog opens
  useEffect(() => {
    const loadData = async () => {
      if (!open || !familyMember) return;

      setIsLoading(true);
      try {
        // Fetch the relationship record
        const { data: relData, error: relError } = await supabase
          .from("client_relationships")
          .select("*")
          .eq("id", familyMember.id)
          .single();

        if (relError) throw relError;

        setRelationshipId(relData.id);

        // If there's a related client, fetch their full data
        if (relData.related_client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("id", relData.related_client_id)
            .single();

          if (clientError) throw clientError;

          // Parse JSONB address fields
          const resAddress = (clientData.residential_address as ResidentialAddress) || {};
          const postalAddress = (clientData.postal_address as PostalAddress) || {};

          form.reset({
            relationship_type: relData.relationship_type as "Spouse" | "Child" | "Parent" | "Sibling",
            family_type: relData.family_name || "",
            show_on_birthday_list: false,
            send_birthday_sms: false,
            cc_pfrs: false,
            cc_email_communications: false,
            product_viewing_level: relData.product_viewing_level || "Full",
            person_type: clientData.person_type || "Individual",
            id_number: clientData.id_number || "",
            country_of_issue: clientData.country_of_issue || "South Africa",
            gender: clientData.gender || "",
            title: clientData.title || "",
            initials: clientData.initials || "",
            first_name: clientData.first_name || "",
            surname: clientData.surname || "",
            preferred_name: clientData.preferred_name || "",
            date_of_birth: clientData.date_of_birth || "",
            home_number: clientData.home_number || "",
            work_number: clientData.work_number || "",
            work_extension: clientData.work_extension || "",
            cell_number: clientData.cell_number || "",
            fax_number: clientData.fax_number || "",
            email: clientData.email || "",
            work_email: clientData.work_email || "",
            website: clientData.website || "",
            twitter: clientData.twitter || "",
            skype: clientData.skype || "",
            youtube: clientData.youtube || "",
            res_address_type: resAddress.type || "Physical",
            res_unit_nr: resAddress.unit_nr || "",
            res_floor: resAddress.floor || "",
            res_building: resAddress.building || "",
            res_farm: resAddress.farm || "",
            res_street_nr: resAddress.street_nr || "",
            res_street: resAddress.street || "",
            res_development: resAddress.development || "",
            res_city: resAddress.city || "",
            res_suburb: resAddress.suburb || "",
            res_code: resAddress.code || "",
            res_province: resAddress.province || "",
            res_country: resAddress.country || "South Africa",
            res_gps_lat: resAddress.gps_lat || "",
            res_gps_long: resAddress.gps_long || "",
            postal_address_type: postalAddress.type || "P.O. Box",
            postal_attention: postalAddress.attention || "",
            postal_po_box: postalAddress.po_box || "",
            postal_city: postalAddress.city || "",
            postal_suburb: postalAddress.suburb || "",
            postal_code: postalAddress.code || "",
          });
        } else {
          // No related client, just use relationship data
          form.reset({
            relationship_type: relData.relationship_type as "Spouse" | "Child" | "Parent" | "Sibling",
            family_type: relData.family_name || "",
            product_viewing_level: relData.product_viewing_level || "Full",
            first_name: relData.name?.split(" ")[0] || "",
            surname: relData.name?.split(" ").slice(1).join(" ") || "",
            id_number: relData.identification || "",
          });
        }
      } catch (error: any) {
        console.error("Error loading family member data:", error);
        toast.error("Failed to load household member data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, familyMember, form]);

  const onSubmit = async (data: EditFamilyMemberFormData) => {
    if (!familyMember || !relationshipId) return;

    setIsSubmitting(true);
    try {
      // Update relationship record
      const { error: relError } = await supabase
        .from("client_relationships")
        .update({
          relationship_type: data.relationship_type,
          family_name: data.family_type || null,
          product_viewing_level: data.product_viewing_level,
          name: `${data.first_name} ${data.surname}`,
          identification: data.id_number || null,
        })
        .eq("id", relationshipId);

      if (relError) throw relError;

      // If there's a related client, update their record too
      if (familyMember.relatedClientId) {
        const residentialAddress = {
          type: data.res_address_type || "",
          unit_nr: data.res_unit_nr || "",
          floor: data.res_floor || "",
          building: data.res_building || "",
          farm: data.res_farm || "",
          street_nr: data.res_street_nr || "",
          street: data.res_street || "",
          development: data.res_development || "",
          city: data.res_city || "",
          suburb: data.res_suburb || "",
          code: data.res_code || "",
          province: data.res_province || "",
          country: data.res_country || "",
          gps_lat: data.res_gps_lat || "",
          gps_long: data.res_gps_long || "",
        };

        const postalAddress = {
          type: data.postal_address_type || "",
          attention: data.postal_attention || "",
          po_box: data.postal_po_box || "",
          city: data.postal_city || "",
          suburb: data.postal_suburb || "",
          code: data.postal_code || "",
        };

        const { error: clientError } = await supabase
          .from("clients")
          .update({
            person_type: data.person_type,
            id_number: data.id_number,
            country_of_issue: data.country_of_issue,
            gender: data.gender || null,
            title: data.title || null,
            initials: data.initials,
            first_name: data.first_name,
            surname: data.surname,
            preferred_name: data.preferred_name,
            date_of_birth: data.date_of_birth || null,
            home_number: data.home_number,
            work_number: data.work_number,
            work_extension: data.work_extension,
            cell_number: data.cell_number,
            fax_number: data.fax_number,
            email: data.email || null,
            work_email: data.work_email,
            website: data.website,
            twitter: data.twitter,
            skype: data.skype,
            youtube: data.youtube,
            residential_address: residentialAddress,
            postal_address: postalAddress,
          })
          .eq("id", familyMember.relatedClientId);

        if (clientError) throw clientError;
      }

      toast.success("Household member updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating family member:", error);
      toast.error(error.message || "Failed to update household member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Household Member</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="relationship" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="relationship">Relationship</TabsTrigger>
                  <TabsTrigger value="identification">Identification</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                </TabsList>

                {/* Relationship Tab */}
                <TabsContent value="relationship" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">Relationship Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="relationship_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Spouse">Spouse</SelectItem>
                                <SelectItem value="Child">Child</SelectItem>
                                <SelectItem value="Parent">Parent</SelectItem>
                                <SelectItem value="Sibling">Sibling</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="family_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Household Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select family type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Nuclear">Nuclear</SelectItem>
                                <SelectItem value="Blended">Blended</SelectItem>
                                <SelectItem value="Extended">Extended</SelectItem>
                                <SelectItem value="Single Parent">Single Parent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-6">
                      <FormField
                        control={form.control}
                        name="show_on_birthday_list"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Show on birthday list</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="send_birthday_sms"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Send birthday SMS</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">Communication Options</h3>
                    <div className="flex gap-6">
                      <FormField
                        control={form.control}
                        name="cc_pfrs"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">CC on PFRs</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cc_email_communications"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">CC on email communications</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">Viewing Access</h3>
                    <FormField
                      control={form.control}
                      name="product_viewing_level"
                      render={({ field }) => (
                        <FormItem className="max-w-xs">
                          <FormLabel>Product Viewing</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full">Full</SelectItem>
                              <SelectItem value="Limited">Limited</SelectItem>
                              <SelectItem value="None">None</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Identification Tab */}
                <TabsContent value="identification" className="space-y-6 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="person_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Person Type</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="id_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country_of_issue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country of Issue</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="South Africa">South Africa</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
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
                        </FormItem>
                      )}
                    />
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
                            </SelectContent>
                          </Select>
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
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birthday</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Names *</FormLabel>
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
                        <FormItem>
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
                      name="preferred_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-6 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="home_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
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
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="work_extension"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extension</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cell_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cell Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fax_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fax Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="work_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="@username" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="skype"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skype</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Address Tab */}
                <TabsContent value="address" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">Residential Address</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="res_address_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Physical">Physical</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_unit_nr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Nr</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_floor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_building"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Building</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="res_farm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_street_nr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Nr</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_development"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Development</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="res_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_suburb"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suburb</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="res_province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Province</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Gauteng">Gauteng</SelectItem>
                                <SelectItem value="Western Cape">Western Cape</SelectItem>
                                <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                                <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                                <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                                <SelectItem value="Limpopo">Limpopo</SelectItem>
                                <SelectItem value="North West">North West</SelectItem>
                                <SelectItem value="Free State">Free State</SelectItem>
                                <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="South Africa">South Africa</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_gps_lat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GPS Latitude</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="res_gps_long"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GPS Longitude</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">Postal Address</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="postal_address_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="P.O. Box">P.O. Box</SelectItem>
                                <SelectItem value="Private Bag">Private Bag</SelectItem>
                                <SelectItem value="Street Address">Street Address</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postal_attention"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attention</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postal_po_box"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>P.O. Box</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="postal_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postal_suburb"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suburb</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditFamilyMemberDialog;
