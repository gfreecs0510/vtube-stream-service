import { ErrorObject } from "ajv";

function transformAjvErrors(errors: ErrorObject[]): ErrorObject[] {
  return errors.map((error: ErrorObject) => {
    if (error.keyword === "errorMessage") {
      const transformedError = {
        instancePath: error.instancePath,
        keyword: error.params.errors[0].keyword,
        message: error.message,
        params: error.params.errors[0].params,
        schemaPath: error.params.errors[0].schemaPath,
      };
      return transformedError;
    }
    return error;
  });
}
export { transformAjvErrors };
