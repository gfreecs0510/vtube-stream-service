export default {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["username", "oldPassword", "newPassword"],
  properties: {
    username: {
      $ref: "./definitions.json#/definitions/Username",
    },
    oldPassword: {
      $ref: "./definitions.json#/definitions/Password",
    },
    newPassword: {
      $ref: "./definitions.json#/definitions/Password",
    },
  },
};
