import mongoose, { Document, Schema } from "mongoose";

interface ISubscription extends Document {
  subscriberId: mongoose.Types.ObjectId;
  subscribedToId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    subscribedToId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index(
  { subscriberId: 1, subscribedToId: 1 },
  { unique: true },
);

const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);

export default Subscription;
