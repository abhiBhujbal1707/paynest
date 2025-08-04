import React, { Suspense } from 'react';
import CreateAccountDrawer from '@/components/createAccountDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { getDashboardData, getUserAccounts } from '../../../../actions/dashboard';
import AccountCard from './_components/AccountCard';
import { getCurrentBudget } from '../../../../actions/budget';
import { BudgetProgress } from './_components/BudgetProgress';
import { DashboardOverview } from './_components/DashboardOverview';

async function DashboardPage() {
  const accounts = await getUserAccounts();
  const accountArray = accounts.data;
  const defaultAccount = accountArray?.find((account) => account.isDefault);
  let budgetData = null;

  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = await getDashboardData();

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 w-full space-y-10">

      {/* Budget Progress */}
      {defaultAccount && (
        <div className="w-full">
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        </div>
      )}

      {/* Dashboard Overview */}
      <div className="max-w-7xl mx-auto w-full">
        <Suspense fallback={"Loading Overview ..."}>
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
          />
        </Suspense>
      </div>

      {/* Accounts Grid */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">

          {/* Add New Account Card */}
          <div className="h-full">
            <CreateAccountDrawer>
              <Card className="h-full flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="h-full flex flex-col justify-between p-3 sm:p-5">
                  <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground">
                    <Plus className="h-8 w-8 sm:h-10 sm:w-10 mb-3" />
                    <p className="text-sm sm:text-base font-medium text-center">
                      Add New Account
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CreateAccountDrawer>
          </div>



          {/* Account Cards */}
          {accounts?.data?.length > 0 ? (
            accounts.data.map((account) => (
              <div key={account.id} className="h-full">
                <AccountCard account={account} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-sm text-muted-foreground py-6">
              No accounts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
