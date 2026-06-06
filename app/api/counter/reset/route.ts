import dbConnect from "@/lib/dbConnect";
import Counter from "@/model/counter";
import { format } from "date-fns";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await dbConnect()

        const today = format(new Date(), "yyyy-MM-dd")

        //reset only daily count
        const record = await Counter.findByIdAndUpdate(
            {date: today},
            {$set: {dailyCount: 0}},
            {new: true}
        )

        if(!record) {
            return NextResponse.json(
                {error: "No record found for today"},
                {status: 404}
            )
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
            {error: "Failed to reset daily counter"},
            {status: 500}
        )
    }
}