import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus } from "lucide-react";
import AddFamilyMemberDialog from "@/components/client-detail/AddFamilyMemberDialog";
import { useClientRelationships } from "@/hooks/useClientRelationships";
import { generateClient360Data } from "@/data/regional360ViewData";

interface PortfolioFilterBarProps {
  clientId: string;
  nationality?: string | null;
  countryOfIssue?: string | null;
}

export default function PortfolioFilterBar({ clientId, nationality, countryOfIssue }: PortfolioFilterBarProps) {
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const { familyMembers, businesses, refetch } = useClientRelationships(clientId);
  const clientData = React.useMemo(() => generateClient360Data(clientId, nationality, countryOfIssue), [clientId, nationality, countryOfIssue]);

  const contractOptions = React.useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    clientData.onPlatformProducts.forEach((p) => opts.push({ value: p.number, label: `${p.product} (${p.number})` }));
    clientData.externalProducts.forEach((p) => opts.push({ value: p.contract, label: `${p.product} (${p.contract})` }));
    clientData.platformCashAccounts.forEach((p) => opts.push({ value: p.accountNumber, label: `${p.name} (${p.accountNumber})` }));
    return opts;
  }, [clientData]);

  const householdOptions = React.useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    familyMembers.forEach((m) => opts.push({ value: m.id, label: `${m.name} (${m.familyType})` }));
    businesses.forEach((b) => opts.push({ value: b.id, label: `${b.name} (${b.type})` }));
    return opts;
  }, [familyMembers, businesses]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <MultiSelect
          options={contractOptions}
          selected={selectedContracts}
          onChange={setSelectedContracts}
          placeholder="Contracts"
          className="w-[220px]"
        />
        <MultiSelect
          options={householdOptions}
          selected={selectedMembers}
          onChange={setSelectedMembers}
          placeholder="Household"
          className="w-[220px]"
        />
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setAddMemberOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Member
        </Button>
      </div>
      <AddFamilyMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        clientId={clientId}
        onSuccess={refetch}
      />
    </>
  );
}
