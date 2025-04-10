import Header from "@/components/Header";
import FinanceSummary from "@/components/FinanceSummary";
import TransactionForm from "@/components/TransactionForm";
import TransactionHistory from "@/components/TransactionHistory";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import BudgetGoals from "@/components/BudgetGoals";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <FinanceSummary />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <TransactionForm />
            <TransactionHistory />
          </div>
          
          <div className="lg:col-span-5 space-y-6">
            <AnalyticsPanel />
            <BudgetGoals />
          </div>
        </div>
      </main>
    </div>
  );
}
