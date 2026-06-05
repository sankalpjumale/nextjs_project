import mongoose, {Schema, Model, Document} from "mongoose";

export interface ICounter extends Document {
    date: string
    dailyCount: number
    totalCount: number
}

const counterSchema = new Schema(
    {
        date: {
            type: String,
            required: true,
            unique: true
        },
        dailyCount: {
            type: Number,
            default: 0
        },
        totalCount: {
            type: Number,
            default: 0
        }
    }, {timestamps: true}
)

const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>  ("Counter", counterSchema)

export default Counter