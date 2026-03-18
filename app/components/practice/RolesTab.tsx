import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, X } from "lucide-react";

const availableRoles = [
  "Accountant",
  "Administrator", 
  "Assistant",
  "Campaign Support",
  "Client",
  "Compliance",
  "Compliance PSL",
  "Financial Adviser",
  "Financial Planning Support",
  "Guest",
  "Head Office Support",
  "Marketing",
  "Provider",
  "Regional Officer"
];

const initialRoles = [
  { id: 1, name: "Financial Adviser" },
  { id: 2, name: "Administrator" },
];

export const RolesTab = () => {
  const [assignedRoles, setAssignedRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleAddRole = () => {
    if (selectedRole && !assignedRoles.find(r => r.name === selectedRole)) {
      setAssignedRoles([...assignedRoles, { id: Date.now(), name: selectedRole }]);
      setSelectedRole("");
    }
  };

  const handleRemoveRole = (roleId: number) => {
    setAssignedRoles(assignedRoles.filter(r => r.id !== roleId));
  };

  const unassignedRoles = availableRoles.filter(
    role => !assignedRoles.find(r => r.name === role)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Roles</h2>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a role to add..." />
          </SelectTrigger>
          <SelectContent>
            {unassignedRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleAddRole}
          disabled={!selectedRole}
          className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
        >
          Add Role
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">{assignedRoles.length} items</div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No roles assigned
                </TableCell>
              </TableRow>
            ) : (
              assignedRoles.map((role, index) => (
                <TableRow key={role.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveRole(role.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
