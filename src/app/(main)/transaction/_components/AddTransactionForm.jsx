"use client"
import { transactionSchema } from '@/app/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import useFetch from '../../../../../hooks/use-fetch'
import { createTransaction, updateTransaction } from '../../../../../actions/transaction'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import CreateAccountDrawer from '@/components/createAccountDrawer'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { format } from 'date-fns'
import { CalendarIcon, DollarSign, CreditCard, Tag, FileText, Repeat, Plus, CheckCircle } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Switch } from '@/components/ui/switch'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import ReciptScanner from './ReciptScanner'
import { Loader2 } from 'lucide-react'
const AddTransactionForm = ({ accounts, categories, editMode = false, initialData = null }) => {
  const router = useRouter()
  const searchParams =   useSearchParams()
  const editId = searchParams.get("edit");
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [completedFields, setCompletedFields] = useState({})

  const { register, setValue, handleSubmit, formState: { errors }, watch, getValues, reset } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
          type: initialData.type,
          amount: initialData.amount.toString(),
          description: initialData.description,
          accountId: initialData.accountId,
          category: initialData.category,
          date: new Date(initialData.date),
          isRecurring: initialData.isRecurring,
          ...(initialData.recurringInterval && {
            recurringInterval: initialData.recurringInterval,
          }),
        }
        : {
          type: "EXPENSE",
          amount: "",
          description: "",
          accountId: accounts.find((ac) => ac.isDefault)?.id,
          date: new Date(),
          isRecurring: false,
        },
  })

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type")
  const isRecurring = watch("isRecurring")
  const date = watch("date")
  const amount = watch("amount")
  const accountId = watch("accountId")
  const category = watch("category")
  const description = watch("description")

  // Track completed fields for animations
  useEffect(() => {
    setCompletedFields({
      amount: amount && amount !== "",
      accountId: accountId,
      category: category,
      description: description && description !== "",
      date: date
    })
  }, [amount, accountId, category, description, date])

  // Entrance animation
  useEffect(() => {
    setIsFormVisible(true)
  }, [])

  const filteredCategories = categories.filter(
    (category) => category.type === type
  )

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };


  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const handleScanComplete = (scannedData) => {
    console.log("amount", scannedData.amount)
    console.log("date", scannedData.date)
    console.log("description", scannedData.description)
    console.log("category", scannedData.category)
    console.log("merchantName", scannedData.date)
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl">

        {/* AI recipt scanner */}

           {!editMode && <ReciptScanner onScanComplete={handleScanComplete} />}

        {/* Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl lg:text-4xl">
            Add Transaction
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base md:mt-2">
            Create a new income or expense transaction
          </p>
        </div>

        {/* Main Form Card */}
        <div className="w-full">
          <div
            className={`overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-200 transition-all duration-700 ease-out sm:rounded-2xl sm:shadow-xl ${isFormVisible
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-8 opacity-0 scale-95'
              }`}
          >
            <form className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:space-y-8 md:p-8" onSubmit={handleSubmit(onSubmit)}>
              {/* Transaction Type */}
              <div
                className={`space-y-2 transition-all duration-500 ease-out delay-100 sm:space-y-3 ${isFormVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
              >
                <label className="flex items-center text-sm font-semibold text-gray-700 sm:text-base">
                  <Tag className="mr-2 h-4 w-4 text-gray-500 transition-colors duration-200" />
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div
                    className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md sm:p-4 ${type === 'EXPENSE'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-md scale-105'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    onClick={() => setValue("type", "EXPENSE")}
                  >
                    <div className="text-sm font-medium transition-all duration-200 sm:text-base">Expense</div>
                    <div className="text-xs text-gray-500 sm:text-sm">Money going out</div>
                  </div>
                  <div
                    className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md sm:p-4 ${type === 'INCOME'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md scale-105'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    onClick={() => setValue("type", "INCOME")}
                  >
                    <div className="text-sm font-medium transition-all duration-200 sm:text-base">Income</div>
                    <div className="text-xs text-gray-500 sm:text-sm">Money coming in</div>
                  </div>
                </div>
                {errors.type && (
                  <p className="text-sm text-red-500 animate-pulse">{errors.type.message}</p>
                )}
              </div>

              {/* Amount and Account Row - Responsive Grid */}
              <div
                className={`grid gap-4 sm:gap-6 md:grid-cols-2 transition-all duration-500 ease-out delay-200 ${isFormVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
              >
                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700 sm:text-base">
                    <DollarSign className={`mr-2 h-4 w-4 transition-colors duration-300 ${completedFields.amount ? 'text-green-500' : 'text-gray-500'
                      }`} />
                    Amount
                    {completedFields.amount && (
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500 animate-bounce" />
                    )}
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`pl-10 h-10 text-base font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 sm:h-12 sm:text-lg ${completedFields.amount ? 'ring-2 ring-green-200 border-green-300' : ''
                        }`}
                      {...register("amount")}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-500 animate-shake">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700 sm:text-base">
                    <CreditCard className={`mr-2 h-4 w-4 transition-colors duration-300 ${completedFields.accountId ? 'text-green-500' : 'text-gray-500'
                      }`} />
                    Account
                    {completedFields.accountId && (
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500 animate-bounce" />
                    )}
                  </label>
                  <Select
                    onValueChange={(value) => setValue("accountId", value)}
                    defaultValue={getValues("accountId")}
                  >
                    <SelectTrigger className={`h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 sm:h-12 ${completedFields.accountId ? 'ring-2 ring-green-200 border-green-300' : ''
                      }`}>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="animate-in slide-in-from-top-2 duration-200">
                      {accounts.data.map((account, index) => (
                        <SelectItem
                          key={account.id}
                          value={account.id}
                          className="transition-colors duration-150 hover:bg-blue-50"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate pr-2">{account.name}</span>
                            <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">
                              ${parseFloat(account.balance).toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      <CreateAccountDrawer>
                        <Button
                          variant="ghost"
                          className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
                        >
                          <Plus className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                          Create New Account
                        </Button>
                      </CreateAccountDrawer>
                    </SelectContent>
                  </Select>
                  {errors.accountId && (
                    <p className="text-sm text-red-500 animate-shake">{errors.accountId.message}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div
                className={`space-y-2 transition-all duration-500 ease-out delay-300 sm:space-y-3 ${isFormVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
              >
                <label className="flex items-center text-sm font-semibold text-gray-700 sm:text-base">
                  <Tag className={`mr-2 h-4 w-4 transition-colors duration-300 ${completedFields.category ? 'text-green-500' : 'text-gray-500'
                    }`} />
                  Category
                  {completedFields.category && (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500 animate-bounce" />
                  )}
                </label>
                <Select
                  onValueChange={(value) => setValue("category", value)}
                  defaultValue={getValues("category")}
                >
                  <SelectTrigger className={`h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 sm:h-12 ${completedFields.category ? 'ring-2 ring-green-200 border-green-300' : ''
                    }`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="animate-in slide-in-from-top-2 duration-200">
                    {filteredCategories.map((category, index) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="transition-colors duration-150 hover:bg-blue-50"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 animate-shake">{errors.category.message}</p>
                )}
              </div>

              {/* Date */}
              <div
                className={`space-y-2 transition-all duration-500 ease-out delay-400 sm:space-y-3 ${isFormVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
              >
                <label className="flex items-center text-sm font-semibold text-gray-700 sm:text-base">
                  <CalendarIcon className={`mr-2 h-4 w-4 transition-colors duration-300 ${completedFields.date ? 'text-green-500' : 'text-gray-500'
                    }`} />
                  Date
                  {completedFields.date && (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500 animate-bounce" />
                  )}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-10 justify-start text-left font-normal border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 hover:shadow-sm sm:h-12 ${completedFields.date ? 'ring-2 ring-green-200 border-green-300' : ''
                        }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="truncate">
                        {date ? format(date, "PPP") : <span className="text-gray-400">Pick a date</span>}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 animate-in slide-in-from-top-2 duration-200" align='start'>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => setValue("date", date)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="transition-all duration-200"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-red-500 animate-shake">{errors.date.message}</p>
                )}
              </div>

              {/* Description */}
              <div
                className={`space-y-2 transition-all duration-500 ease-out delay-500 sm:space-y-3 ${isFormVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
              >
                <label className="flex items-center text-sm font-semibold text-gray-700 sm:text-base">
                  <FileText className={`mr-2 h-4 w-4 transition-colors duration-300 ${completedFields.description ? 'text-green-500' : 'text-gray-500'
                    }`} />
                  Description
                  {completedFields.description && (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500 animate-bounce" />
                  )}
                </label>
                <Input
                  placeholder="Enter transaction description..."
                  className={`h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 sm:h-12 ${completedFields.description ? 'ring-2 ring-green-200 border-green-300' : ''
                    }`}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 animate-shake">{errors.description.message}</p>
                )}
              </div>

              {/* Recurring Transaction Toggle */}
              <div
                className={`rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-500 ease-out delay-600 hover:shadow-md sm:p-6 ${isFormVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  } ${isRecurring ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 sm:items-center">
                  <div className="flex-1 space-y-1">
                    <label className="flex items-center text-sm font-semibold text-gray-700 sm:text-base">
                      <Repeat className={`mr-2 h-4 w-4 transition-all duration-300 sm:h-5 sm:w-5 ${isRecurring ? 'text-blue-500 animate-spin' : 'text-gray-500'
                        }`} />
                      Recurring Transaction
                    </label>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      Set up automatic recurring schedule for this transaction
                    </p>
                  </div>
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={(checked) => setValue("isRecurring", checked)}
                    className="data-[state=checked]:bg-blue-600 transition-all duration-200 shrink-0"
                  />
                </div>

                {/* Recurring Interval */}
                <div className={`mt-4 space-y-2 transition-all duration-300 ease-out sm:mt-6 sm:space-y-3 ${isRecurring
                  ? 'opacity-100 max-h-32 translate-y-0'
                  : 'opacity-0 max-h-0 -translate-y-2 overflow-hidden'
                  }`}>
                  <label className="text-sm font-semibold text-gray-700">
                    Recurring Interval
                  </label>
                  <Select
                    onValueChange={(value) => setValue("recurringInterval", value)}
                    defaultValue={getValues("recurringInterval")}
                  >
                    <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 sm:h-12">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent className="animate-in slide-in-from-top-2 duration-200">
                      <SelectItem value="DAILY" className="transition-colors duration-150 hover:bg-blue-50">Daily</SelectItem>
                      <SelectItem value="WEEKLY" className="transition-colors duration-150 hover:bg-blue-50">Weekly</SelectItem>
                      <SelectItem value="MONTHLY" className="transition-colors duration-150 hover:bg-blue-50">Monthly</SelectItem>
                      <SelectItem value="YEARLY" className="transition-colors duration-150 hover:bg-blue-50">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.recurringInterval && (
                    <p className="text-sm text-red-500 animate-shake">
                      {errors.recurringInterval.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div
                className={`flex flex-col gap-3 pt-4 sm:flex-row sm:pt-6 transition-all duration-500 ease-out delay-700 ${isFormVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-10 border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-md sm:h-12"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={transactionLoading}>
                  {transactionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editMode ? "Updating..." : "Creating..."}
                    </>
                  ) : editMode ? (
                    "Update Transaction"
                  ) : (
                    "Create Transaction"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom CSS for additional animations and responsive utilities */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        /* Extra small screens */
        @media (max-width: 475px) {
          .xs\\:max-w-sm {
            max-width: 24rem;
          }
        }

        /* Better text truncation for mobile */
        @media (max-width: 640px) {
          .truncate {
            max-width: 120px;
          }
        }

        /* Improved hover effects for touch devices */
        @media (hover: none) {
          .hover\\:scale-105:hover {
            transform: none;
          }
          
          .hover\\:shadow-md:hover {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}

export default AddTransactionForm