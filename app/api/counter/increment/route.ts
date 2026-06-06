import dbConnect from "@/lib/dbConnect";
import Counter from "@/model/counter";
import { NextResponse } from "next/server";
import {format} from "date-fns"

export async function POST() {
    try {
        await dbConnect()

        const today = format(new Date(), "yyyy-MM-dd")

        let record = await Counter.findOne({date: today})

        if(!record) {
            const latest = await Counter.findOne().sort({createdAt: -1})
            const lastTotal = latest ? latest.totalCount : 0

            record = await Counter.create(
                {
                    date: today,
                    dailyCount: 0,
                    totalCount: lastTotal
                }
            )
        }

        //incremen both the counts
        record = await Counter.findByIdAndUpdate(
            {date: today},
            {$inc: {dailyCount: 1, totalCount: 1}},
            {new: true}
        )

        return NextResponse.json(
            {
                date: record!.date,
                dailyCount: record!.dailyCount,
                totalCount: record!.totalCount
            }
        )

    } catch (error) {
        return NextResponse.json(
            {error: "Filed to increment counter"},
            {status: 500}
        )
    }
}