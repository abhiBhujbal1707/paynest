import { seedTransactions } from "../../../../actions/seed";

export async function GET() {
    const result = await seedTransactions()
    return Response.json({
        success: true,
        // count:result.count,
        message: `Created ${result.count} transactions`,
    });
}