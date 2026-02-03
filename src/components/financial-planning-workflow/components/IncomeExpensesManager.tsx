import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useClientIncome, ClientIncome } from "@/hooks/useClientIncome";
import { useClientExpenses, ClientExpense } from "@/hooks/useClientExpenses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IncomeExpensesManagerProps {
  clientId: string;
  onDataChange: () => void;
}

const INCOME_TYPES = ["Salary", "Rental", "Investment", "Pension", "Business", "Commission", "Bonus", "Other"];
const EXPENSE_CATEGORIES = ["Housing", "Transport", "Insurance", "Food", "Utilities", "Healthcare", "Education", "Entertainment", "Personal", "Debt Repayment", "Savings", "Other"];
const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually"];

export const IncomeExpensesManager = ({ clientId, onDataChange }: IncomeExpensesManagerProps) => {
  const { income, loading: incomeLoading, addIncome, updateIncome, deleteIncome, getMonthlyIncome } = useClientIncome(clientId);
  const { expenses, loading: expensesLoading, addExpense, updateExpense, deleteExpense, getMonthlyExpenses, getEssentialExpenses } = useClientExpenses(clientId);

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingIncome, setEditingIncome] = useState<ClientIncome | null>(null);
  const [editingExpense, setEditingExpense] = useState<ClientExpense | null>(null);

  const [incomeForm, setIncomeForm] = useState({
    income_type: "Salary",
    source_name: "",
    gross_amount: 0,
    net_amount: 0,
    frequency: "Monthly",
    is_taxable: true,
  });

  const [expenseForm, setExpenseForm] = useState({
    expense_category: "Housing",
    expense_type: "Fixed",
    name: "",
    amount: 0,
    frequency: "Monthly",
    is_essential: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddIncome = () => {
    setEditingIncome(null);
    setIncomeForm({ income_type: "Salary", source_name: "", gross_amount: 0, net_amount: 0, frequency: "Monthly", is_taxable: true });
    setShowIncomeDialog(true);
  };

  const handleEditIncome = (inc: ClientIncome) => {
    setEditingIncome(inc);
    setIncomeForm({
      income_type: inc.income_type,
      source_name: inc.source_name,
      gross_amount: inc.gross_amount,
      net_amount: inc.net_amount || 0,
      frequency: inc.frequency,
      is_taxable: inc.is_taxable,
    });
    setShowIncomeDialog(true);
  };

  const handleSaveIncome = async () => {
    if (editingIncome) {
      await updateIncome(editingIncome.id, incomeForm);
    } else {
      await addIncome({
        client_id: clientId,
        ...incomeForm,
        net_amount: incomeForm.net_amount || null,
        linked_asset_id: null,
        start_date: null,
        end_date: null,
        is_portal_visible: true,
      });
    }
    setShowIncomeDialog(false);
    onDataChange();
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({ expense_category: "Housing", expense_type: "Fixed", name: "", amount: 0, frequency: "Monthly", is_essential: true });
    setShowExpenseDialog(true);
  };

  const handleEditExpense = (exp: ClientExpense) => {
    setEditingExpense(exp);
    setExpenseForm({
      expense_category: exp.expense_category,
      expense_type: exp.expense_type,
      name: exp.name,
      amount: exp.amount,
      frequency: exp.frequency,
      is_essential: exp.is_essential,
    });
    setShowExpenseDialog(true);
  };

  const handleSaveExpense = async () => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseForm);
    } else {
      await addExpense({
        client_id: clientId,
        ...expenseForm,
        linked_liability_id: null,
        is_portal_visible: true,
      });
    }
    setShowExpenseDialog(false);
    onDataChange();
  };

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  if (incomeLoading || expensesLoading) {
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
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground">Monthly Income</p>
          </div>
          <p className="text-lg font-bold text-primary">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <p className="text-sm text-muted-foreground">Monthly Expenses</p>
          </div>
          <p className="text-lg font-bold text-destructive">{formatCurrency(monthlyExpenses)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Monthly Surplus</p>
          <p className={`text-lg font-bold ${monthlySurplus >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(monthlySurplus)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="income">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">Income ({income.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddIncome} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Income
            </Button>
          </div>

          {income.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No income recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {income.map(inc => (
                  <TableRow key={inc.id}>
                    <TableCell>{inc.income_type}</TableCell>
                    <TableCell>{inc.source_name}</TableCell>
                    <TableCell>{inc.frequency}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inc.gross_amount)}</TableCell>
                    <TableCell className="text-right">{inc.net_amount ? formatCurrency(inc.net_amount) : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditIncome(inc)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteIncome(inc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddExpense} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>

          {expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No expenses recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.expense_category}</TableCell>
                    <TableCell>{exp.name}</TableCell>
                    <TableCell>{exp.expense_type}</TableCell>
                    <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditExpense(exp)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteExpense(exp.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Income Dialog */}
      <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIncome ? "Edit Income" : "Add Income"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Income Type</Label>
              <Select value={incomeForm.income_type} onValueChange={v => setIncomeForm(f => ({ ...f, income_type: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source Name</Label>
              <Input
                value={incomeForm.source_name}
                onChange={e => setIncomeForm(f => ({ ...f, source_name: e.target.value }))}
                placeholder="e.g., Employer Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={incomeForm.frequency} onValueChange={v => setIncomeForm(f => ({ ...f, frequency: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(freq => (
                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gross Amount (R)</Label>
                <Input
                  type="number"
                  value={incomeForm.gross_amount}
                  onChange={e => setIncomeForm(f => ({ ...f, gross_amount: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Net Amount (R)</Label>
                <Input
                  type="number"
                  value={incomeForm.net_amount}
                  onChange={e => setIncomeForm(f => ({ ...f, net_amount: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="taxable"
                checked={incomeForm.is_taxable}
                onCheckedChange={checked => setIncomeForm(f => ({ ...f, is_taxable: checked as boolean }))}
              />
              <Label htmlFor="taxable">Taxable income</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIncomeDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveIncome} disabled={!incomeForm.source_name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={expenseForm.expense_category} onValueChange={v => setExpenseForm(f => ({ ...f, expense_category: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={expenseForm.name}
                onChange={e => setExpenseForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Rent Payment"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={expenseForm.expense_type} onValueChange={v => setExpenseForm(f => ({ ...f, expense_type: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={expenseForm.frequency} onValueChange={v => setExpenseForm(f => ({ ...f, frequency: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Amount (R)</Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={e => setExpenseForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="essential"
                checked={expenseForm.is_essential}
                onCheckedChange={checked => setExpenseForm(f => ({ ...f, is_essential: checked as boolean }))}
              />
              <Label htmlFor="essential">Essential expense</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveExpense} disabled={!expenseForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
