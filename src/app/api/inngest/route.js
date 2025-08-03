import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlerts, generateMonthlyReports, processRecurringTransaction, triggerRecurrinTransactions } from "@/lib/inngest/functions";
//import { helloWorld } from "@/lib/inngest/functions";
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts,
    triggerRecurrinTransactions,
    processRecurringTransaction,
    generateMonthlyReports
  ],
});