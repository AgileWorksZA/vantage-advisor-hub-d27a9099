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

const familyMemberSchema = z.object({
  relationship_type: z.enum(["Spouse", "Child", "Parent", "Sibling"]),
  title: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  initials: z.string().optional(),
  id_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  cell_number: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  product_viewing_level: z.string().optional(),
});

type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

interface AddFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSuccess: () => void;
}

const AddFamilyMemberDialog = ({ open, onOpenChange, clientId, onSuccess }: AddFamilyMemberDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      relationship_type: "Spouse",
      title: "",
      first_name: "",
      surname: "",
      initials: "",
      id_number: "",
      date_of_birth: "",
      cell_number: "",
      email: "",
      product_viewing_level: "Full",
    },
  });

  const onSubmit = async (data: FamilyMemberFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // First create the family member as a client
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          profile_state: "Active",
          profile_type: "Prospect",
          client_type: "individual",
          title: data.title || null,
          first_name: data.first_name,
          surname: data.surname,
          initials: data.initials || null,
          id_number: data.id_number || null,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender || null,
          cell_number: data.cell_number || null,
          email: data.email || null,
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
          name: `${data.first_name} ${data.surname}`,
          entity_type: "Individual",
          relationship_type: data.relationship_type,
          identification: data.id_number || null,
          id_type: "SA ID",
          product_viewing_level: data.product_viewing_level || "Full",
        });

      if (relationshipError) throw relationshipError;

      toast.success("Family member added successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding family member:", error);
      toast.error(error.message || "Failed to add family member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="relationship_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormItem>
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
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                {isSubmitting ? "Adding..." : "Add Family Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFamilyMemberDialog;
