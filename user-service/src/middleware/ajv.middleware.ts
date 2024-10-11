import { Request, Response, NextFunction } from "express";
import { transformAjvErrors } from "../transformers/ajvError.transformer";
import Ajv from "../clients/ajvSchema.client";

export const validateSchema = (
  type: "RegisterRequest" | "LoginRequest" | "ChangePasswordRequest",
) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const validate = Ajv.getSchema(type);
    if (!validate) {
      return res
        .status(500)
        .json({ message: `validation schema for ${type} not found` });
    }

    const valid = validate(req.body);
    if (!valid) {
      return res.status(400).json({
        message: "validation error",
        errors: transformAjvErrors(validate.errors ?? []),
      });
    }
    next();
    return;
  };
};
