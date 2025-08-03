import React, { Suspense } from 'react'
import { getAccountById } from '../../../../../actions/dashboard'
import { notFound } from 'next/navigation'
import TransactionTable from '../_components/TransactionTable'
import { BarLoader } from 'react-spinners'
import {AccountChart} from '../_components/AccountChart'

const AccountPage = async ({ params }) => {
    const { id } = await params;
    const accountData = await getAccountById(id)
    if (!accountData) {
        notFound()
    }
    const { transactions, ...account } = accountData;

    return (

        <>
            <div className="flex flex-col gap-8 space-y-0 sm:flex-row sm:items-end sm:gap-4 sm:justify-between
    px-4 sm:px-6 md:px-8 max-w-7xl mx-auto"
            >
                <div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-500">
                        {account.name}
                    </h1>

                    <p>{account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
                </div>
                <div className=' pb-2'>
                    <div className='text-xl sm:text-2xl font-bold'>
                        ${parseFloat(account.balance).toFixed(2)}
                    </div>
                    <p className='text-sm text-muted-foreground'>{account._count.transactions} Transactions</p>
                </div>



            </div>
            <div className='my-4 '>
                {/* Chart Section */}
                <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea'/>}>
                <AccountChart transactions={transactions ?? []}  />

                </Suspense>
                {/* Transaction Table */}

                <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea' />}>
                    <TransactionTable transactions={transactions ?? []}></TransactionTable>
                </Suspense>
            </div>
        </>


    )
}

export default AccountPage
