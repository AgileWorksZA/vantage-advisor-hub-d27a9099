import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Pencil, Plus, RotateCcw, Search, Settings, X } from "lucide-react";

const initialTeamsData = [
  { id: 1, name: "Danie Jordaan Financial Planning LTD", office: "Tygerwaterfront The Edge", role: "Financial planner", leader: "Jordaan, Danie", isPrimary: true, dbId: 629 },
  { id: 2, name: "Danie Jordaan Financial Planning LTD", office: "Tygerwaterfront The Edge", role: "Assistant", leader: "Jordaan, Danie", isPrimary: false, dbId: 629 },
  { id: 3, name: "PSG Wealth Tygervalley", office: "Tygerwaterfront The Edge", role: "Financial planner", leader: "Van der Berg, Johan", isPrimary: false, dbId: 2341 },
  { id: 4, name: "PSG Support Team", office: "Head Office - Stellenbosch", role: "Support", leader: "Abels, Dale", isPrimary: false, dbId: 1823 },
  { id: 5, name: "Compliance Central", office: "Head Office - Stellenbosch", role: "Compliance Officer", leader: "Abhangi, Kalpesh", isPrimary: false, dbId: 982 },
  { id: 6, name: "Marketing Division", office: "Head Office - Stellenbosch", role: "Marketing Lead", leader: "Alexander, Chad", isPrimary: false, dbId: 1456 },
];

export const TeamsTab = () => {
  const [teams, setTeams] = useState(initialTeamsData);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = teams.filter(
    team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.office.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReset = () => {
    setSearchQuery("");
    setTeams(initialTeamsData);
  };

  const handleDelete = (teamId: number) => {
    setTeams(teams.filter(t => t.id !== teamId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">myPractice Teams</h2>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]">
          <Plus className="w-4 h-4 mr-2" />
          Add new
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{filteredTeams.length} items</div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead className="text-center">Is Primary</TableHead>
              <TableHead className="w-20">ID</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No teams found
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-[hsl(180,70%,45%)] font-medium cursor-pointer hover:underline">
                    {team.name}
                  </TableCell>
                  <TableCell>{team.office}</TableCell>
                  <TableCell>{team.role}</TableCell>
                  <TableCell>{team.leader}</TableCell>
                  <TableCell className="text-center">
                    {team.isPrimary ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>{team.dbId}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(team.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
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
