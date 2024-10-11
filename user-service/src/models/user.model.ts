import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser extends Document {
  username: string;
  password: string;
  followerCount: number;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  followerCount: { type: Number, default: 0 },
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
