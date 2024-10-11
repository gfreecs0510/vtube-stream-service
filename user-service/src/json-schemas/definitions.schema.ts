export default {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  definitions: {
    Username: {
      type: "string",
      format: "email",
      description: "Must be a valid email address.",
      errorMessage: {
        format: "Username must be a valid email address.",
      },
    },
    Password: {
      type: "string",
      pattern: "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])(?=.*\\S).{10,72}$",
      description:
        "Password must be between 10 and 72 characters, contain at least one uppercase letter, one digit, one special character, and no spaces.",
      errorMessage: {
        pattern:
          "Password must meet the complexity requirements: must be between 10 and 72 characters, one uppercase letter, one digit, one special character, and no spaces.",
      },
    },
  },
};
