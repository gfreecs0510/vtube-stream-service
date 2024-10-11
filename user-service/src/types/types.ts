import * as express from "express";

export interface UserData {
  _id: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      context: {
        userData?: UserData;
      };
    }
  }
}
