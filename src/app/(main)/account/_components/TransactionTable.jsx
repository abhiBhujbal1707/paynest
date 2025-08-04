"use client"
import React, { useMemo, useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { categoryColors } from '@/data/categories'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCcw, Search, Trash, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { bulkDeleteTransactions } from '../../../../../actions/dashboard'
import useFetch from '../../../../../hooks/use-fetch'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const itemsPerPage = 8

const TransactionTable = ({ transactions }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [recurringFilter, setRecurringFilter] = useState("")
    const [selectedIds, setSelectedIds] = useState([])
    const [page, setPage] = useState(1)
    const router = useRouter()

    const { loading: deleteLoading, fn: deleteFn, data: deleted } = useFetch(bulkDeleteTransactions)
    const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" })

    const recurringIntervals = {
        DAILY: "Daily",
        WEEKLY: "Weekly",
        MONTHLY: "Monthly",
        YEARLY: "Yearly",
    }

    const filteredTransactions = useMemo(() => {
        let result = [...transactions]
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) => transaction.description?.toLowerCase().includes(searchLower));
        }
        if (recurringFilter) {
            result = result.filter((transaction) =>
                recurringFilter === "recurring" ? transaction.isRecurring : !transaction.isRecurring
            )
        }
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter)
        }

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date)
                    break;
                case "amount":
                    comparison = a.amount - b.amount
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category)
                    break;
                default:
                    break;
            }
            return sortConfig.direction === "asc" ? comparison : -comparison
        })

        return result;
    }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig])

    const total_pages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const paginated_data = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    const handleSort = (field) => {
        setSortConfig((current) => ({
            field,
            direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
        }))
    }

    const handleSelect = (id) => {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    }

    const handleSelectAll = () => {
        setSelectedIds((current) =>
            current.length === filteredTransactions.length
                ? []
                : filteredTransactions.map((t) => t.id)
        )
    }

    const handleBulkDelete = () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`))
            return
        deleteFn(selectedIds)
        setSelectedIds([])
    }

    const handleClearFilters = () => {
        setSearchTerm("")
        setTypeFilter("")
        setRecurringFilter("")
        setSelectedIds([])
    }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.error("Transactions deleted successfully")
        }
    }, [deleted, deleteLoading])

    useEffect(() => {
        setPage(1)
    }, [searchTerm, typeFilter, recurringFilter])

    return (
        <div className='space-y-4 mt-4'>
            {deleteLoading && (
                <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
            )}

            {/* Filters */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div className='relative flex-1 min-w-[200px] '>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        className="pl-8"
                        placeholder="Search Transaction..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                    <div className="flex flex-wrap gap-2 items-center">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="min-w-[120px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INCOME">Income</SelectItem>
                                <SelectItem value="EXPENSE">Expense</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={recurringFilter} onValueChange={setRecurringFilter}>
                            <SelectTrigger className="min-w-[140px]">
                                <SelectValue placeholder="All Transactions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recurring">Recurring Only</SelectItem>
                                <SelectItem value="non-recurring">Non Recurring Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 items-center justify-end mx-1">
                        {selectedIds.length > 0 && (
                            <Button variant="destructive" onClick={handleBulkDelete}>
                                <Trash className="h-4 w-4 mr-1" />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        )}
                        {(searchTerm || typeFilter || recurringFilter) && (
                            <Button variant="outline" size="icon" onClick={handleClearFilters}>
                                <X className="h-4 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className='rounded-lg border overflow-x-auto'>
                <Table className="min-w-[600px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox onCheckedChange={handleSelectAll} checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0} />
                            </TableHead>
                            <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                                <div className='flex items-center'>Date
                                    {sortConfig.field === 'date' && (
                                        sortConfig.direction === 'asc'
                                            ? <ChevronUp className='ml-1 h-4 w-4' />
                                            : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead onClick={() => handleSort("category")} className="cursor-pointer">
                                <div className='flex items-center'>Category
                                    {sortConfig.field === 'category' && (
                                        sortConfig.direction === 'asc'
                                            ? <ChevronUp className='ml-1 h-4 w-4' />
                                            : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("amount")} className="cursor-pointer">
                                <div className='flex items-center'>Amount
                                    {sortConfig.field === 'amount' && (
                                        sortConfig.direction === 'asc'
                                            ? <ChevronUp className='ml-1 h-4 w-4' />
                                            : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated_data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No Transactions Found
                                </TableCell>
                            </TableRow>
                        ) : (
                            <AnimatePresence mode="wait">
                                {paginated_data.map((transaction) => (
                                    <motion.tr
                                        key={transaction.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.25 }}
                                        className="gap-1"
                                    >
                                        <TableCell>
                                            <Checkbox onCheckedChange={() => handleSelect(transaction.id)} checked={selectedIds.includes(transaction.id)} />
                                        </TableCell>
                                        <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell className="capitalize">
                                            <span style={{ background: categoryColors[transaction.category] }} className='px-2 py-1.5 rounded text-white text-sm'>{transaction.category}</span>
                                        </TableCell>
                                        <TableCell className="flex justify-center font-medium" style={{ color: transaction.type === "EXPENSE" ? "red" : "green" }}>
                                            {transaction.type === "EXPENSE" ? "-" : "+"}${transaction.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.isRecurring ? (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                            <RefreshCcw className='h-3 w-3' />
                                                            {recurringIntervals[transaction.recurringInterval]}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <div className='text-sm'>
                                                            <div className='font-medium'>Next Date:</div>
                                                            <div>{format(new Date(transaction.nextRecurringDate), "PP")}</div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <Badge variant="outline" className="gap-1">
                                                    <Clock className='h-3 w-3' />
                                                    One-Time
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-4 w-full mx-auto py-4">
                {page > 1 && (
                    <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                        Previous
                    </Button>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Page</span>
                    <span className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded-md">{page}</span>
                    <span className="text-sm text-gray-600">of {total_pages}</span>
                </div>
                {page < total_pages && (
                    <Button variant="outline" onClick={() => setPage((prev) => Math.min(prev + 1, total_pages))}>
                        Next
                    </Button>
                )}
            </div>
        </div>
    )
}

export default TransactionTable
