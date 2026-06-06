import dbConnect from "@/lib/dbConnect";
import Counter from "@/model/counter";
import { NextResponse } from "next/server";
import {format} from "date-fns"

export async function GET() {
    try {
        await dbConnect()

        const today = format(new Date(), "yyyy-MM-dd")

        //find today's counter
        let record = await Counter.findOne({date: today})

        //if no record for today, find the latest total and create a new day
        if(!record) {
            const latest = await Counter.findOne().sort({createdAt: -1})
            const lastTotal = latest ? latest.totalCount : 0

            record = await Counter.create({
                date: today,
                dailyCount: 0,
                totalCount: lastTotal
            })
        }

        return NextResponse.json(
            {
                date: record.date,
                dailyCount: record.dailyCount,
                totalCount: record.totalCount
            }
        )
    } catch (error) {
        return NextResponse.json(
            {success: false, message: "Failed to fetch counter"},
            {status: 500}
        )
    }
}