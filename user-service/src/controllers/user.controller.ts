import { Request, Response } from "express";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Subscription from "../models/subscription.model";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET ?? "my-secret";

export async function login(req: Request, resp: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user === null) {
      resp.status(404).json({ message: "user not found" });
      return;
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      resp.status(403).json({ message: "unauthorized" });
      return;
    }

    const token = generateToken({ _id: user._id as string, username });
    resp.status(200).json({ token, message: "success" });
  } catch (err) {
    console.log("login error", { err });
    resp.status(500).json({ message: "internal server error" });
  }
}

export async function register(req: Request, resp: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (await User.findOne({ username })) {
      resp.status(400).json({ message: "username already exists" });
      return;
    }

    const hashPassword = await hash(password, 10);

    const newUser = await new User({ username, password: hashPassword }).save();

    const token = generateToken({
      _id: newUser._id as string,
      username,
    });

    resp.status(201).json({
      token,
      user: {
        _id: newUser._id as string,
        username,
      },
      message: "success",
    });
  } catch (err) {
    console.log("register error", { err });
    resp.status(500).json({ message: "internal server error" });
  }
}

export async function changePassword(
  req: Request,
  resp: Response,
): Promise<void> {
  try {
    const { username, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      resp.status(404).json({ message: "user not found" });
      return;
    }

    if (!(await compare(oldPassword, user.password))) {
      resp.status(403).json({ message: "unauthorized" });
      return;
    }

    const hashPassword = await hash(newPassword, 10);

    user.set({ password: hashPassword });
    await user.save();

    const token = generateToken({
      _id: user._id as string,
      username,
    });

    resp.status(200).json({
      token,
      user: {
        _id: user._id as string,
        username,
      },
      message: "success",
    });
  } catch (err) {
    console.log("change password error", { err });
    resp.status(500).json({ message: "internal server error" });
  }
}

export async function getUser(req: Request, resp: Response): Promise<void> {
  try {
    const userId: string = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      resp.status(400).json({ message: "invalid user ID format" });
      return;
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      resp.status(404).json({ message: "user not found" });
      return;
    }

    resp.status(200).json({
      username: user.username,
      _id: user._id,
      followerCount: user.followerCount,
    });
  } catch (err) {
    console.log("get user error", { err });
    resp.status(500).json({ message: "internal server error" });
  }
}

export async function subscribe(req: Request, resp: Response): Promise<void> {
  try {
    const subscriberId: string = req.context.userData?._id as string;
    const subscribedToId: string = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(subscribedToId)) {
      resp.status(400).json({ message: "invalid user ID format" });
      return;
    }

    if (subscriberId === subscribedToId) {
      resp.status(400).json({ message: "cannot subscribe to itself" });
      return;
    }

    const subscribeTo = await User.findOne({ _id: subscribedToId });
    if (!subscribeTo) {
      resp
        .status(400)
        .json({ message: "cannot subscribe to a non existing user" });
      return;
    }

    await new Subscription({
      subscribedToId,
      subscriberId,
    }).save();

    const updatedUser = await User.findByIdAndUpdate(
      subscribeTo._id,
      { $inc: { followerCount: 1 } },
      { new: true },
    );

    if (!updatedUser) {
      resp
        .status(400)
        .json({ message: "cannot subscribe to a non existing user" });
      return;
    }

    resp.status(200).json({
      subscribedTo: {
        username: updatedUser.username,
        _id: updatedUser._id,
        followerCount: updatedUser.followerCount,
      },
      message: "success",
    });
    return;
  } catch (err: any) {
    console.log("subscribe error", { err });
    if (err.code === 11000) {
      resp
        .status(409)
        .json({ message: "You are already subscribed to this user" });
    } else {
      resp.status(500).json({ message: "internal server error" });
    }
  }
}

export async function unsubscribe(req: Request, resp: Response): Promise<void> {
  try {
    const subscriberId: string = req.context.userData?._id as string;
    const subscribedToId: string = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(subscribedToId)) {
      resp.status(400).json({ message: "invalid user ID format" });
      return;
    }

    if (subscriberId === subscribedToId) {
      resp.status(400).json({ message: "cannot unsubscribe to itself" });
      return;
    }

    const subscription = await Subscription.findOneAndDelete({
      subscribedToId,
      subscriberId,
    });

    if (!subscription) {
      resp.status(404).json({ message: "you are not subscribed to this user" });
      return;
    }

    await User.findByIdAndUpdate(
      subscribedToId,
      { $inc: { followerCount: -1 } },
      { new: true },
    );

    resp.status(200).json({
      message: "success",
    });
    return;
  } catch (err) {
    console.log("Unsubscribe error", { err });
    resp.status(500).json({ message: "internal server error" });
  }
}

function generateToken(user: { _id: string; username: string }): string {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  );
}
