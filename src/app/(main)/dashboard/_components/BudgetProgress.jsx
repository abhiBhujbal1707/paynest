"use client"
import { useState, useEffect } from "react";
import { Pencil, Check, X, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import useFetch from "../../../../../hooks/use-fetch";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "../../../../../actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(
        initialBudget?.amount?.toString() || ""
    );

    const {
        loading: isLoading,
        fn: updateBudgetFn,
        data: updatedBudget,
        error,
    } = useFetch(updateBudget);

    const percentUsed = initialBudget
        ? (currentExpenses / initialBudget.amount) * 100
        : 0;

    const remainingBudget = initialBudget
        ? initialBudget.amount - currentExpenses
        : 0;

    const handleUpdateBudget = async () => {
        const amount = parseFloat(newBudget);

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        await updateBudgetFn(amount);
    };

    const handleCancel = () => {
        setNewBudget(initialBudget?.amount?.toString() || "");
        setIsEditing(false);
    };

    useEffect(() => {
        if (updatedBudget?.success) {
            setIsEditing(false);
            toast.success("Budget updated successfully");
        }
    }, [updatedBudget]);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update budget");
        }
    }, [error]);

    const getProgressColor = () => {
        if (percentUsed >= 90) return "bg-red-500";
        if (percentUsed >= 75) return "bg-amber-500";
        return "bg-emerald-500";
    };

    const getStatusIcon = () => {
        if (percentUsed >= 90) return <AlertTriangle className="h-4 w-4 text-red-500" />;
        if (percentUsed >= 75) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Card className="w-full shadow-sm hover:shadow-md transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-blue-100">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-semibold text-gray-900 truncate">
                                Monthly Budget
                            </CardTitle>
                            {!isEditing && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsEditing(true)}
                                    className="h-7 w-7 hover:bg-gray-100 ml-auto sm:ml-0"
                                >
                                    <Pencil className="h-3.5 w-3.5 text-gray-500" />
                                </Button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="relative flex-1 max-w-xs">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                        <Input
                                            type="number"
                                            value={newBudget}
                                            onChange={(e) => setNewBudget(e.target.value)}
                                            className="pl-7 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="0.00"
                                            autoFocus
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleUpdateBudget}
                                        disabled={isLoading}
                                        className="h-9 w-9 hover:bg-emerald-50 hover:text-emerald-600"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="h-9 w-9 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <CardDescription className="text-sm text-gray-600">
                                    Default Account
                                </CardDescription>
                                {initialBudget ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(currentExpenses)} of {formatCurrency(initialBudget.amount)} spent
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon()}
                                            <span className={`font-medium ${percentUsed >= 90 ? 'text-red-600' :
                                                    percentUsed >= 75 ? 'text-amber-600' :
                                                        'text-emerald-600'
                                                }`}>
                                                {percentUsed.toFixed(1)}% used
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No budget set</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            {initialBudget && !isEditing && (
                <CardContent className="pt-0">
                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="relative">
                                <Progress
                                    value={Math.min(percentUsed, 100)}
                                    className="h-3 bg-gray-100"
                                />
                                <div
                                    className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                />
                                {percentUsed > 100 && (
                                    <div className="absolute -top-1 -right-1">
                                        <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                                            <AlertTriangle className="h-3 w-3 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remaining
                                    </span>
                                    <div className={`text-sm font-semibold ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                        {formatCurrency(remainingBudget)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Daily Avg
                                    </span>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(currentExpenses / new Date().getDate())}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        {percentUsed >= 90 && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-red-800">
                                        {percentUsed >= 100
                                            ? "Budget exceeded!"
                                            : "Budget nearly exhausted!"
                                        }
                                    </p>
                                    <p className="text-xs text-red-600 mt-1">
                                        {percentUsed >= 100
                                            ? `You've overspent by ${formatCurrency(Math.abs(remainingBudget))}`
                                            : `Only ${formatCurrency(remainingBudget)} remaining this month`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}