import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const businessSchema = z.object({
  link_type: z.enum(["Beneficiary", "Owner", "Director", "Shareholder", "Trustee", "Member", "Business Partner"]),
  entity_type: z.enum(["Trust", "Company", "Close Corporation"]),
  business_name: z.string().min(1, "Business name is required"),
  registration_number: z.string().optional(),
  share_percentage: z.number().min(0).max(100).optional(),
  product_viewing_level: z.string().optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface AddBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSuccess: () => void;
}

const AddBusinessDialog = ({ open, onOpenChange, clientId, onSuccess }: AddBusinessDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      link_type: "Beneficiary",
      entity_type: "Trust",
      business_name: "",
      registration_number: "",
      share_percentage: undefined,
      product_viewing_level: "Full",
    },
  });

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // First create the business as a client
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          profile_state: "Active",
          profile_type: "Prospect",
          client_type: "business",
          first_name: data.business_name,
          surname: "", // Business entities use first_name as the full name
          id_number: data.registration_number || null,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Then create the relationship linking to the new client
      const { error: relationshipError } = await supabase
        .from("client_relationships")
        .insert({
          user_id: user.id,
          client_id: clientId,
          related_client_id: newClient.id,
          name: data.business_name,
          entity_type: data.entity_type,
          relationship_type: data.link_type,
          identification: data.registration_number || null,
          id_type: "Registration",
          product_viewing_level: data.product_viewing_level || "Full",
          share_percentage: data.share_percentage || null,
        });

      if (relationshipError) throw relationshipError;

      toast.success("Business added successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding business:", error);
      toast.error(error.message || "Failed to add business");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Business Entity</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="link_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select link type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beneficiary">Beneficiary</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Shareholder">Shareholder</SelectItem>
                      <SelectItem value="Trustee">Trustee</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Business Partner">Business Partner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Trust">Trust</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Close Corporation">Close Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Smith Family Trust" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., IT2345/2020" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="share_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share Percentage</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ""}
                        placeholder="0-100" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_viewing_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Viewing Level</FormLabel>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
              >
                {isSubmitting ? "Adding..." : "Add Business"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBusinessDialog;
