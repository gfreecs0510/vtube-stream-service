import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserData } from "../types/types";

const JWT_SECRET = process.env.JWT_SECRET ?? "my-secret";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const token = req.headers["token"] as string;

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      });
    });

    const userData: UserData = {
      _id: (decoded as any)._id,
      username: (decoded as any).username,
    };

    if (!req.context) {
      req.context = {};
    }

    req.context.userData = userData;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};

export default verifyToken;
