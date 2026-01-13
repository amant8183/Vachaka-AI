import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const User = mongoose.model<IUser>("User", UserSchema);
