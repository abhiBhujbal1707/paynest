
import React, { Suspense } from 'react'
import CreateAccountDrawer from '@/components/createAccountDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { getDashboardData, getUserAccounts } from '../../../../actions/dashboard'
import AccountCard from './_components/AccountCard'
import { getCurrentBudget } from '../../../../actions/budget'
import { BudgetProgress } from './_components/BudgetProgress'
import { DashboardOverview } from './_components/DashboardOverview'
async function DashboardPage() {
  const accounts = await getUserAccounts()
  const accountArray = accounts.data
  const defaultAccount = accountArray?.find((account) => account.isDefault)
  let budgetData = null;
  
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id)

  } 

  const transactions = await getDashboardData()
  // console.log("Transactions:",transactions)
  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 w-full">
      {/* Budget Progress */}
      <div className='my-7'>
        {defaultAccount && <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0} />}
      </div>
        <Suspense fallback={"Loading Overview ... "}>
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
          />
        </Suspense>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Plus className="h-8 w-8 sm:h-10 sm:w-10 mb-2" />
              <p className="text-sm sm:text-base">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts?.data?.length > 0 ? (
          accounts.data.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))
        ) : (
          <div className="col-span-full text-center text-sm text-muted-foreground py-6">
            No accounts found.
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
