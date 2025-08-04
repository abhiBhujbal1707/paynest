import React from 'react'
import { getUserAccounts } from '../../../../../actions/dashboard'
import { defaultCategories } from '@/data/categories'
import AddTransactionForm from '../_components/AddTransactionForm'
import { getTransaction } from '../../../../../actions/transaction'
const AddTransaction = async ({ searchParams }) => {
    const accounts = await getUserAccounts()
    const _searchParams = await searchParams;
    const editId = _searchParams?.edit
    let initialData = null;
    if (editId) {
        const transaction = await getTransaction(editId)
        initialData = transaction;
    }
    return (
        <div className='max-w-3xl mx-auto px-5'>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-8 text-center tracking-tight drop-shadow-md">
                Add Transaction
            </h1>
            <AddTransactionForm
                accounts={accounts}
                categories={defaultCategories}
                editMode={!!editId}
                initialData={initialData}
            />
        </div>
    )
}

export default AddTransaction
