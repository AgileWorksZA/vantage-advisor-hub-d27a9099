import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Target, Calendar } from "lucide-react";
import { useClientGoals, ClientGoal } from "@/hooks/useClientGoals";
import { format } from "date-fns";

interface GoalsManagerProps {
  clientId: string;
  workflowId: string;
  onDataChange: () => void;
}

const GOAL_CATEGORIES = ["Retirement", "Education", "Wealth", "Protection", "Estate", "Emergency", "Major Purchase", "Debt Freedom", "Other"];
const PRIORITIES = ["Critical", "Important", "Aspirational"];

export const GoalsManager = ({ clientId, workflowId, onDataChange }: GoalsManagerProps) => {
  const { goals, loading, addGoal, updateGoal, deleteGoal, getTotalTargetAmount, getTotalCurrentFunding } = useClientGoals(clientId, workflowId);

  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ClientGoal | null>(null);

  const [form, setForm] = useState({
    goal_name: "",
    description: "",
    goal_category: "Retirement",
    priority: "Important",
    target_amount: 0,
    target_date: "",
    current_funding: 0,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAdd = () => {
    setEditingGoal(null);
    setForm({
      goal_name: "",
      description: "",
      goal_category: "Retirement",
      priority: "Important",
      target_amount: 0,
      target_date: "",
      current_funding: 0,
    });
    setShowDialog(true);
  };

  const handleEdit = (goal: ClientGoal) => {
    setEditingGoal(goal);
    setForm({
      goal_name: goal.goal_name,
      description: goal.description || "",
      goal_category: goal.goal_category,
      priority: goal.priority,
      target_amount: goal.target_amount,
      target_date: goal.target_date || "",
      current_funding: goal.current_funding,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    const fundingStatus = form.current_funding >= form.target_amount 
      ? "Ahead" 
      : form.current_funding >= form.target_amount * 0.8 
        ? "On Track" 
        : form.current_funding > 0 
          ? "Behind" 
          : "Not Started";

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        ...form,
        description: form.description || null,
        target_date: form.target_date || null,
        funding_status: fundingStatus,
      });
    } else {
      await addGoal({
        client_id: clientId,
        workflow_id: workflowId,
        ...form,
        description: form.description || null,
        target_date: form.target_date || null,
        funding_status: fundingStatus,
        is_active: true,
      });
    }
    setShowDialog(false);
    onDataChange();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "destructive";
      case "Important": return "default";
      default: return "secondary";
    }
  };

  const getFundingStatusColor = (status: string) => {
    switch (status) {
      case "Ahead": return "default";
      case "On Track": return "secondary";
      case "Behind": return "outline";
      default: return "outline";
    }
  };

  const totalTarget = getTotalTargetAmount();
  const totalFunding = getTotalCurrentFunding();
  const fundingPercentage = totalTarget > 0 ? (totalFunding / totalTarget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Active Goals</p>
          <p className="text-2xl font-bold">{goals.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Target</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(totalTarget)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Overall Progress</p>
          <p className="text-lg font-bold">{fundingPercentage.toFixed(0)}%</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h4 className="font-medium">Financial Goals</h4>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No financial goals defined yet</p>
          <p className="text-sm">Click "Add Goal" to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {goals.map(goal => {
            const progress = goal.target_amount > 0 ? (goal.current_funding / goal.target_amount) * 100 : 0;
            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{goal.goal_name}</h5>
                        <Badge variant={getPriorityColor(goal.priority)} className="text-xs">
                          {goal.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {goal.goal_category}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          Target: <strong>{formatCurrency(goal.target_amount)}</strong>
                        </span>
                        <span>
                          Funded: <strong>{formatCurrency(goal.current_funding)}</strong>
                        </span>
                        {goal.target_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(goal.target_date), "MMM yyyy")}
                          </span>
                        )}
                        <Badge variant={getFundingStatusColor(goal.funding_status)}>
                          {goal.funding_status}
                        </Badge>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Add Financial Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                value={form.goal_name}
                onChange={e => setForm(f => ({ ...f, goal_name: e.target.value }))}
                placeholder="e.g., Retirement Fund"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the goal..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.goal_category} onValueChange={v => setForm(f => ({ ...f, goal_category: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Amount (R)</Label>
                <Input
                  type="number"
                  value={form.target_amount}
                  onChange={e => setForm(f => ({ ...f, target_amount: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={form.target_date}
                  onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Current Funding (R)</Label>
              <Input
                type="number"
                value={form.current_funding}
                onChange={e => setForm(f => ({ ...f, current_funding: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.goal_name}>Save Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
