"use server"
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { isDate } from "date-fns";
import { revalidatePath } from "next/cache";
import { includes, success } from "zod";

const serilizeTransaction = (obj) => {
    const serilized = { ...obj }

    if (obj.balance) {
        serilized.balance = obj.balance.toNumber();
    }
    // if (obj?.amount) {
    //     serilized.amount = obj.account.toNumber();
    // }
    return serilized;
}


const serializeAccount = (account) => {
    return {
        ...account,
        balance: account.balance?.toNumber(),
        transactions: account.transactions?.map(serializeTransactions) ?? [],
    };
};

const serializeTransactions = (transaction) => {
    return {
        ...transaction,
        amount: transaction.amount?.toNumber?.() ?? 0,
    };
};



export async function createAccount(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unathorized User");
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });
        if (!user) throw new Error("User not found");

        const balanceFloat = parseFloat(data.balance);
        if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

        const existingAccount = await db.account.findMany({
            where: { userId: user.id }
        });
        const shouldBeDfault = existingAccount.length === 0 ? true : data.isDefault;
        if (shouldBeDfault) {
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            })
        }


        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDfault
            }
        })
        const serilizedAccount = serilizeTransaction(account);
        revalidatePath("/dashboard");
        return { success: true, data: serilizedAccount };
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function getUserAccounts() {


    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User")
    const user = await db.user.findUnique({
        where: { clerkUserId: userId }
    });
    if (!user) throw new Error("User not fount")

    const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    });

    const serilizedAccounts = accounts.map(serilizeTransaction);
    return { success: true, data: serilizedAccounts };




}

export async function updateDefaultAccount(accountId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unathorized User");
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });
        if (!user) throw new Error("User not found");

        await db.account.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
        })

        const account = await db.account.update({
            where: {
                userId: user.id,
                id: accountId
            },
            data: {
                isDefault: true
            },
        })
        revalidatePath('/dashboard')
        return { success: true, data: serilizeTransaction(account) }
    } catch (error) {
        throw new Error(error.message)
    }
}

export async function getAccountById(accountId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unathorized User");
    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        }
    });
    if (!user) throw new Error("User not found");
    const account = await db.account.findUnique({
        where: {
            id: accountId,
            userId: user.id
        },
        include: {
            transactions: {
                orderBy: { date: "desc" },
            },
            _count: {
                select: { transactions: true },
            },
        },
    })
    if (!account) return null;
    // return {
    //     ...serilizeTransaction(account),
    //     transactions: account.transactions.map(serilizeTransaction)
    // }
    return serializeAccount(account);
}

export async function bulkDeleteTransactions(transactionIds) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        // Get transactions to calculate balance changes
        const transactions = await db.transaction.findMany({
            where: {
                id: { in: transactionIds },
                userId: user.id,
            },
        });

        // Group transactions by account to update balances
        const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            const change =
                transaction.type === "EXPENSE"
                    ? transaction.amount
                    : -transaction.amount;
            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
        }, {});

        // Delete transactions and update account balances in a transaction
        await db.$transaction(async (tx) => {
            // Delete transactions
            await tx.transaction.deleteMany({
                where: {
                    id: { in: transactionIds },
                    userId: user.id,
                },
            });

            // Update account balances
            for (const [accountId, balanceChange] of Object.entries(
                accountBalanceChanges
            )) {
                await tx.account.update({
                    where: { id: accountId },
                    data: {
                        balance: {
                            increment: balanceChange,
                        },
                    },
                });
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/account/[id]");

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getDashboardData(){
      const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        const transactions = await db.transaction.findMany({
            where:{userId:user.id},
            orderBy:{date:"desc"}
        })
        return transactions.map(serializeTransactions)
}