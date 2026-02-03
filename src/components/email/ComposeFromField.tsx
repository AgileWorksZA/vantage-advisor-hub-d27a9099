import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTeamMembers, TeamMember } from "@/hooks/useTeamMembers";

interface ComposeFromFieldProps {
  currentUserEmail: string;
  currentUserName: string;
  selectedTeamMemberId: string | null;
  onTeamMemberChange: (id: string | null) => void;
  fromPrimaryAdviser: boolean;
  onFromPrimaryAdviserChange: (value: boolean) => void;
}

export const ComposeFromField = ({
  currentUserEmail,
  currentUserName,
  selectedTeamMemberId,
  onTeamMemberChange,
  fromPrimaryAdviser,
  onFromPrimaryAdviserChange,
}: ComposeFromFieldProps) => {
  const { teamMembers, isLoading } = useTeamMembers();

  const selectedValue = selectedTeamMemberId || "me";

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">From</Label>
      <div className="flex items-center gap-4">
        <Select
          value={selectedValue}
          onValueChange={(value) => onTeamMemberChange(value === "me" ? null : value)}
          disabled={fromPrimaryAdviser}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select sender..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="me">
              {currentUserName} ({currentUserEmail})
            </SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} ({member.email})
                {member.is_primary_adviser && " - Primary Adviser"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            id="primaryAdviser"
            checked={fromPrimaryAdviser}
            onCheckedChange={(checked) => onFromPrimaryAdviserChange(!!checked)}
          />
          <Label htmlFor="primaryAdviser" className="text-sm cursor-pointer">
            Send from primary adviser
          </Label>
        </div>
      </div>
    </div>
  );
};
