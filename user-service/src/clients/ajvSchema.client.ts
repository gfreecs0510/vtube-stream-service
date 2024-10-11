import Ajv, { ValidateFunction } from "ajv";
import addErrors from "ajv-errors";
import addFormats from "ajv-formats";
import definitionsSchema from "../json-schemas/definitions.schema";
import registerRequestSchema from "../json-schemas/registerRequest.schema";
import loginRequestSchema from "../json-schemas/loginRequest.schema";
import changePasswordRequestSchema from "../json-schemas/changePasswordRequest.schema";

type SchemaDictionary = Record<string, ValidateFunction>;

class AjvSchema {
  private static instance: AjvSchema;
  public schemas: SchemaDictionary;

  private constructor() {
    const ajv = new Ajv({ allErrors: true });
    addErrors(ajv);
    addFormats(ajv);
    ajv.addSchema(definitionsSchema, "definitions.json");
    this.schemas = {
      RegisterRequest: ajv.compile(registerRequestSchema),
      LoginRequest: ajv.compile(loginRequestSchema),
      ChangePasswordRequest: ajv.compile(changePasswordRequestSchema),
    };
  }

  public static getInstance(): AjvSchema {
    if (!AjvSchema.instance) {
      AjvSchema.instance = new AjvSchema();
    }
    return AjvSchema.instance;
  }

  public getSchema(name: string): ValidateFunction {
    return this.schemas[name];
  }
}

export default AjvSchema.getInstance();
