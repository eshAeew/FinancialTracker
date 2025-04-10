import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/lib/utils";

export default function FinanceSummary() {
  const { totalBalance, totalIncome, totalExpenses } = useFinance();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Total Balance Card */}
      <Card className="border border-neutral-100">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-500 font-medium">Total Balance</h3>
            <div className="rounded-full bg-primary/10 p-2">
              <i className="ri-wallet-3-line text-lg text-primary"></i>
            </div>
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-neutral-500 mt-1">Updated today</p>
        </CardContent>
      </Card>
      
      {/* Total Income Card */}
      <Card className="border border-neutral-100">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-500 font-medium">Total Income</h3>
            <div className="rounded-full bg-success/10 p-2">
              <i className="ri-arrow-up-circle-line text-lg text-success"></i>
            </div>
          </div>
          <p className="text-2xl font-semibold text-success">{formatCurrency(totalIncome)}</p>
          <p className="text-sm text-neutral-500 mt-1">Last 30 days</p>
        </CardContent>
      </Card>
      
      {/* Total Expenses Card */}
      <Card className="border border-neutral-100">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-500 font-medium">Total Expenses</h3>
            <div className="rounded-full bg-destructive/10 p-2">
              <i className="ri-arrow-down-circle-line text-lg text-destructive"></i>
            </div>
          </div>
          <p className="text-2xl font-semibold text-destructive">{formatCurrency(totalExpenses)}</p>
          <p className="text-sm text-neutral-500 mt-1">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
