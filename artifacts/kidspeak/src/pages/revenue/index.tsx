import { useState } from "react";
import { useGetRevenueDashboard, useListExpenses, useCreateExpense } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Receipt as ReceiptIcon, Minus, Equal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell as PieCell } from "recharts";
import { useLanguage } from "@/contexts/language-context";

const BRAND_BLUE = "#1B2E8F";
const BRAND_YELLOW = "#F5A600";

const expenseSchema = z.object({
  category: z.enum(["rent", "utilities", "salaries", "materials", "maintenance", "other"]),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01),
  expenseDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function RevenueDashboard() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: dashboard, isLoading: isLoadingDash } = useGetRevenueDashboard({ month });
  const { data: expenses = [], refetch: refetchExpenses } = useListExpenses({ month });
  const { mutate: createExpense, isPending: isCreatingExpense } = useCreateExpense();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "other",
      description: "",
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      notes: "",
    }
  });

  const onSubmitExpense = (data: ExpenseFormValues) => {
    createExpense({ data }, {
      onSuccess: () => {
        toast({ title: t.revenue.expenseLog });
        setIsExpenseOpen(false);
        form.reset();
        refetchExpenses();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.error, variant: "destructive" });
      }
    });
  };

  if (isLoadingDash) {
    return <div className="p-8 text-center text-muted-foreground">{t.revenue.loadingFinancial}</div>;
  }

  if (!dashboard) return null;

  const STATUS_COLORS = {
    paid: 'hsl(142.1 76.2% 36.3%)',
    partially_paid: 'hsl(38 92% 50%)',
    pending: 'hsl(215 16.3% 46.9%)',
    overdue: 'hsl(0 84.2% 60.2%)',
  };

  const statusData = [
    { name: t.status.paid, value: dashboard.paymentStatusBreakdown.paid, color: STATUS_COLORS.paid },
    { name: t.status.partially_paid, value: dashboard.paymentStatusBreakdown.partially_paid, color: STATUS_COLORS.partially_paid },
    { name: t.status.pending, value: dashboard.paymentStatusBreakdown.pending, color: STATUS_COLORS.pending },
    { name: t.status.overdue, value: dashboard.paymentStatusBreakdown.overdue, color: STATUS_COLORS.overdue },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t.revenue.title}</h1>
        <div className="flex items-center gap-4">
          <Input 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
            className="w-40"
          />
          <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary"><Plus className="w-4 h-4 me-2" /> {t.revenue.recordExpense}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.revenue.recordNewExpense}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitExpense)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.revenue.category}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rent">{t.revenue.categories.rent}</SelectItem>
                            <SelectItem value="utilities">{t.revenue.categories.utilities}</SelectItem>
                            <SelectItem value="salaries">{t.revenue.categories.salaries}</SelectItem>
                            <SelectItem value="materials">{t.revenue.categories.materials}</SelectItem>
                            <SelectItem value="maintenance">{t.revenue.categories.maintenance}</SelectItem>
                            <SelectItem value="other">{t.revenue.categories.other}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.revenue.amount}</FormLabel>
                        <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.revenue.description}</FormLabel>
                      <FormControl><Input placeholder="..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="expenseDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.revenue.date}</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={isCreatingExpense}>
                    {isCreatingExpense ? t.revenue.saving : t.revenue.saveExpense}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.revenue.totalCollected}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2 text-emerald-700">
              {t.currency.format(dashboard.totalCollected)}
              <ArrowUpRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.revenue.totalDue}</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {t.currency.format(dashboard.totalDue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.revenue.totalExpenses}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
              {t.currency.format(dashboard.totalExpenses)}
              <ArrowDownRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Profit & Loss Statement */}
      {(() => {
        const net = dashboard.netRevenue;
        const isProfit = net >= 0;
        return (
          <Card className="overflow-hidden shadow-md border-0">
            <div className="px-6 py-3 flex items-center gap-2" style={{ backgroundColor: BRAND_BLUE }}>
              {isProfit
                ? <TrendingUp className="w-4 h-4" style={{ color: BRAND_YELLOW }} />
                : <TrendingDown className="w-4 h-4" style={{ color: "#fca5a5" }} />
              }
              <span className="text-white font-bold text-sm uppercase tracking-wider">{t.revenue.plStatement}</span>
              <span className="ms-auto text-white/60 text-xs">{t.revenue.plSubtitle}</span>
            </div>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                {/* Income line */}
                <div className="flex items-center gap-4 px-6 py-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-100">
                    <ArrowUpRight className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.revenue.totalIncome}</div>
                    <div className="text-2xl font-black text-emerald-700">{t.currency.formatFixed(dashboard.totalCollected)}</div>
                  </div>
                </div>

                {/* Expenses line */}
                <div className="flex items-center gap-4 px-6 py-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-100">
                    <Minus className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.revenue.expensesDeducted}</div>
                    <div className="text-2xl font-black text-red-600">{t.currency.formatFixed(dashboard.totalExpenses)}</div>
                  </div>
                </div>

                {/* Net result */}
                <div className={`flex items-center gap-4 px-6 py-5 ${isProfit ? "bg-emerald-50/50" : "bg-red-50/50"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isProfit ? "bg-emerald-600" : "bg-red-600"}`}>
                    <Equal className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{isProfit ? t.revenue.netProfit : t.revenue.netLoss}</div>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest" style={{ backgroundColor: isProfit ? "#16a34a" : "#dc2626", color: "white" }}>
                        {isProfit ? t.revenue.profitBadge : t.revenue.lossBadge}
                      </span>
                    </div>
                    <div className="text-3xl font-black" style={{ color: isProfit ? "#16a34a" : "#dc2626" }}>
                      {isProfit ? "" : "−"}{t.currency.formatFixed(Math.abs(net))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.revenue.revenueByLevel}</CardTitle>
            <CardDescription>{t.revenue.collectedVsDue}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {dashboard.revenueByLevel.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.revenueByLevel} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="levelName" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={t.currency.tickFormat} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [t.currency.format(value), ""]}
                  />
                  <Legend />
                  <Bar dataKey="collected" name={t.revenue.collected} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="due" name={t.revenue.due} fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">{t.revenue.noRevenueThisMonth}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.revenue.paymentStatus}</CardTitle>
            <CardDescription>{t.revenue.invoiceBreakdown}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <PieCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, ""]}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground">{t.revenue.noInvoicesThisMonth}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t.revenue.expenseLog}</CardTitle>
            <CardDescription>{t.revenue.expensesFor(format(new Date(month + "-01"), "MMMM yyyy"))}</CardDescription>
          </div>
          <ReceiptIcon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg">
              {t.revenue.noExpensesThisMonth}
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map(expense => (
                <div key={expense.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="font-semibold">{expense.description}</div>
                    <div className="text-sm text-muted-foreground flex gap-2 items-center mt-1">
                      <span className="capitalize">
                        {t.revenue.categories[expense.category as keyof typeof t.revenue.categories] || expense.category}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(expense.expenseDate), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="font-bold text-destructive">
                    -{t.currency.formatFixed(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
