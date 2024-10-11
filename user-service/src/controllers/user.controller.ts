import { Request, Response } from "express";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

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
