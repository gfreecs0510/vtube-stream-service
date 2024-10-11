export default {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["username", "password"],
  properties: {
    username: {
      $ref: "./definitions.json#/definitions/Username",
    },
    password: {
      $ref: "./definitions.json#/definitions/Password",
    },
  },
};
