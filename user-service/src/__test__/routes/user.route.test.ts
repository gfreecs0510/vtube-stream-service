import request from "supertest";
import express from "express";
import router from "../../routes/user.route";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import User from "../../models/user.model";

const app = express();
app.use(express.json());
app.use(router);

describe("User routes", () => {
  const mockUsername = "user@example.com";
  const mockUsernameForSub = "usersub@example.com";
  const mockPassword = "Valid1@password";
  const mockNewPassword = "NewValid1@password";
  let mongoServer: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("POST /register", () => {
    it("should return 201 for valid request", async () => {
      const response = await request(app)
        .post("/register")
        .send({ username: mockUsername, password: mockPassword });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("success");
    });

    describe("Failed registration", () => {
      it.each([
        {
          description: "username not in the body",
          requestBody: { password: mockPassword },
          expectedError: {
            instancePath: "",
            keyword: "required",
            params: { missingProperty: "username" },
          },
        },
        {
          description: "username is non-string",
          requestBody: { username: 123, password: mockPassword },
          expectedError: {
            instancePath: "/username",
            keyword: "type",
          },
        },
        {
          description: "username is not in email format",
          requestBody: { username: "invalidemail", password: mockPassword },
          expectedError: {
            instancePath: "/username",
            keyword: "format",
          },
        },
        {
          description: "username already exist",
          requestBody: { username: mockUsername, password: mockPassword },
          expectedMessage: "username already exists",
        },
        {
          description: "password not in the body",
          requestBody: { username: mockUsername },
          expectedError: {
            instancePath: "",
            keyword: "required",
            params: { missingProperty: "password" },
          },
        },
        {
          description: "password is non-string",
          requestBody: { username: mockUsername, password: 123123 },
          expectedError: {
            instancePath: "/password",
            keyword: "type",
          },
        },
        {
          description: "password is less than 10 characters",
          requestBody: { username: mockUsername, password: "short" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password is too short",
          requestBody: { username: mockUsername, password: "Short1!" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password without special character",
          requestBody: { username: mockUsername, password: "NoSpecial123" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password without uppercase letter",
          requestBody: { username: mockUsername, password: "nouppercase1!" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password without digit",
          requestBody: { username: mockUsername, password: "NoDigit!" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password is too long",
          requestBody: {
            username: mockUsername,
            password: "A".repeat(73) + "1!",
          },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
      ])(
        "should return 400 for invalid request when $description",
        async ({ requestBody, expectedError, expectedMessage }) => {
          const response = await request(app)
            .post("/register")
            .send(requestBody);

          expect(response.status).toBe(400);

          if (expectedMessage) {
            expect(response.body.message).toBe(expectedMessage);
          }

          if (expectedError) {
            expect(response.body.errors).toEqual(
              expect.arrayContaining([expect.objectContaining(expectedError)]),
            );
          }
        },
      );
    });

    describe("Error handling", () => {
      it("should return 500 when a server error occurs", async () => {
        jest.spyOn(bcrypt, "hash").mockImplementationOnce(() => {
          throw new Error("hash crash");
        });
        const response = await request(app)
          .post("/register")
          .send({ username: "new@email.com", password: mockPassword });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("internal server error");
      });
    });
  });

  describe("POST /login", () => {
    it("should return 200 for valid request", async () => {
      const response = await request(app)
        .post("/login")
        .send({ username: mockUsername, password: mockPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");
    });

    describe("Failed login", () => {
      it.each([
        {
          description: "username not in the body",
          requestBody: { password: mockPassword },
          expectedError: {
            instancePath: "",
            keyword: "required",
            params: { missingProperty: "username" },
          },
        },
        {
          description: "username is non-string",
          requestBody: { username: 123, password: mockPassword },
          expectedError: {
            instancePath: "/username",
            keyword: "type",
          },
        },
        {
          description: "username is not in email format",
          requestBody: { username: "invalidemail", password: mockPassword },
          expectedError: {
            instancePath: "/username",
            keyword: "format",
          },
        },
        {
          description: "password not in the body",
          requestBody: { username: mockUsername },
          expectedError: {
            instancePath: "",
            keyword: "required",
            params: { missingProperty: "password" },
          },
        },
        {
          description: "password is non-string",
          requestBody: { username: mockUsername, password: 123123 },
          expectedError: {
            instancePath: "/password",
            keyword: "type",
          },
        },
        {
          description: "password is less than 10 characters",
          requestBody: { username: mockUsername, password: "short" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password is too short",
          requestBody: { username: mockUsername, password: "Short1!" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password without special character",
          requestBody: { username: mockUsername, password: "NoSpecial123" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password without uppercase letter",
          requestBody: { username: mockUsername, password: "nouppercase1!" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password without digit",
          requestBody: { username: mockUsername, password: "NoDigit!" },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "password is too long",
          requestBody: {
            username: mockUsername,
            password: "A".repeat(73) + "1!",
          },
          expectedError: {
            instancePath: "/password",
            keyword: "pattern",
          },
        },
        {
          description: "user not founds",
          requestBody: {
            username: "valid@email.com",
            password: mockPassword,
          },
          expectedMessage: "user not found",
          expectedStatus: 404,
        },
        {
          description: "password does not match",
          requestBody: {
            username: mockUsername,
            password: `${mockPassword}-blah`,
          },
          expectedMessage: "unauthorized",
          expectedStatus: 403,
        },
      ])(
        "should return 400 for invalid request when $description",
        async ({
          requestBody,
          expectedError,
          expectedStatus,
          expectedMessage,
        }) => {
          const response = await request(app).post("/login").send(requestBody);

          expect(response.status).toBe(expectedStatus ?? 400);

          if (expectedMessage) {
            expect(response.body.message).toBe(expectedMessage);
          }

          if (expectedError) {
            expect(response.body.errors).toEqual(
              expect.arrayContaining([expect.objectContaining(expectedError)]),
            );
          }
        },
      );
    });

    describe("Error handling", () => {
      it("should return 500 when a server error occurs", async () => {
        jest.spyOn(bcrypt, "compare").mockImplementationOnce(() => {
          throw new Error("compare crash");
        });

        const response = await request(app)
          .post("/login")
          .send({ username: mockUsername, password: mockPassword });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("internal server error");
      });
    });
  });

  describe("PUT /changePassword", () => {
    let token: string;
    beforeAll(async () => {
      const response = await request(app)
        .post("/login")
        .send({ username: mockUsername, password: mockPassword });
      token = response.body.token;
    });

    it("should return 200 for valid request", async () => {
      const response = await request(app)
        .patch("/changePassword")
        .set("token", token)
        .send({
          username: mockUsername,
          oldPassword: mockPassword,
          newPassword: mockNewPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");
    });

    describe("Failed change password", () => {
      it.each([
        {
          description: "username not in the body",
          requestBody: { oldPassword: mockPassword, newPassword: mockPassword },
          expectedError: {
            instancePath: "",
            keyword: "required",
            params: { missingProperty: "username" },
          },
        },
        {
          description: "username is non-string",
          requestBody: {
            username: 123,
            oldPassword: mockPassword,
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/username",
            keyword: "type",
          },
        },
        {
          description: "username is not in email format",
          requestBody: {
            username: "invalidemail",
            oldPassword: mockPassword,
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/username",
            keyword: "format",
          },
        },
        {
          description: "oldPassword not in the body",
          requestBody: { username: mockUsername, newPassword: mockPassword },
          expectedError: {
            instancePath: "",
            keyword: "required",
            params: { missingProperty: "oldPassword" },
          },
        },
        {
          description: "oldPassword is non-string",
          requestBody: {
            username: mockUsername,
            oldPassword: 123123,
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/oldPassword",
            keyword: "type",
          },
        },
        {
          description: "oldPassword is less than 10 characters",
          requestBody: {
            username: mockUsername,
            oldPassword: "short",
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/oldPassword",
            keyword: "pattern",
          },
        },
        {
          description: "oldPassword is too short",
          requestBody: {
            username: mockUsername,
            oldPassword: "Short1!",
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/oldPassword",
            keyword: "pattern",
          },
        },
        {
          description: "oldPassword without special character",
          requestBody: {
            username: mockUsername,
            oldPassword: "NoSpecial123",
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/oldPassword",
            keyword: "pattern",
          },
        },
        {
          description: "oldPassword without uppercase letter",
          requestBody: {
            username: mockUsername,
            oldPassword: "nouppercase1!",
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/oldPassword",
            keyword: "pattern",
          },
        },
        {
          description: "oldPassword without digit",
          requestBody: {
            username: mockUsername,
            oldPassword: "NoDigit!",
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/oldPassword",
            keyword: "pattern",
          },
        },
        {
          description: "oldPassword is too long",
          requestBody: {
            username: mockUsername,
            oldPassword: "A".repeat(73) + "1!",
            newPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/oldPassword",
            keyword: "pattern",
          },
        },
        {
          description: "newPassword not in the body",
          requestBody: { username: mockUsername, oldPassword: mockPassword },
          expectedError: {
            instancePath: "",
            keyword: "required",
            params: { missingProperty: "newPassword" },
          },
        },
        {
          description: "newPassword is non-string",
          requestBody: {
            username: mockUsername,
            newPassword: 123123,
            oldPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/newPassword",
            keyword: "type",
          },
        },
        {
          description: "newPassword is less than 10 characters",
          requestBody: {
            username: mockUsername,
            newPassword: "short",
            oldPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/newPassword",
            keyword: "pattern",
          },
        },
        {
          description: "newPassword is too short",
          requestBody: {
            username: mockUsername,
            newPassword: "Short1!",
            oldPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/newPassword",
            keyword: "pattern",
          },
        },
        {
          description: "newPassword without special character",
          requestBody: {
            username: mockUsername,
            newPassword: "NoSpecial123",
            oldPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/newPassword",
            keyword: "pattern",
          },
        },
        {
          description: "newPassword without uppercase letter",
          requestBody: {
            username: mockUsername,
            newPassword: "nouppercase1!",
            oldPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/newPassword",
            keyword: "pattern",
          },
        },
        {
          description: "newPassword without digit",
          requestBody: {
            username: mockUsername,
            newPassword: "NoDigit!",
            oldPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/newPassword",
            keyword: "pattern",
          },
        },
        {
          description: "newPassword is too long",
          requestBody: {
            username: mockUsername,
            newPassword: "A".repeat(73) + "1!",
            oldPassword: mockPassword,
          },
          expectedError: {
            instancePath: "/newPassword",
            keyword: "pattern",
          },
        },
        {
          description: "user not founds",
          requestBody: {
            username: "valid@email.com",
            oldPassword: mockPassword,
            newPassword: mockPassword,
          },
          expectedMessage: "user not found",
          expectedStatus: 404,
        },
        {
          description: "password does not match",
          requestBody: {
            username: mockUsername,
            oldPassword: `${mockPassword}-blah`,
            newPassword: mockPassword,
          },
          expectedMessage: "unauthorized",
          expectedStatus: 403,
        },
      ])(
        "should return 400 for invalid request when $description",
        async ({
          requestBody,
          expectedError,
          expectedStatus,
          expectedMessage,
        }) => {
          const response = await request(app)
            .patch("/changePassword")
            .set("token", token)
            .send(requestBody);

          expect(response.status).toBe(expectedStatus ?? 400);

          if (expectedMessage) {
            expect(response.body.message).toBe(expectedMessage);
          }

          if (expectedError) {
            expect(response.body.errors).toEqual(
              expect.arrayContaining([expect.objectContaining(expectedError)]),
            );
          }
        },
      );
    });

    describe("Error handling", () => {
      it("should return 500 when a server error occurs", async () => {
        jest.spyOn(bcrypt, "compare").mockImplementationOnce(() => {
          throw new Error("compare crash");
        });
        const response = await request(app)
          .patch("/changePassword")
          .set("token", token)
          .send({
            username: mockUsername,
            oldPassword: mockPassword,
            newPassword: mockNewPassword,
          });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("internal server error");
      });
    });
  });

  describe("GET /:id", () => {
    it("should return 200 and the info of the user", async () => {
      const user = await User.findOne({ username: mockUsername });

      const response = await request(app).get(`/${user?._id}`).send();

      expect(response.status).toBe(200);
      expect(response.body.username).toEqual(user?.username);
      expect(response.body._id).toEqual(user?._id?.toString());
      expect(response.body.followerCount).toEqual(user?.followerCount);
    });

    describe("Failed get user", () => {
      it.each([
        {
          description: "user does not exist",
          userId: "6527ed7b9b0a1a3c9b0d02a5",
          expectedStatusCode: 404,
          expectedMessage: "user not found",
        },
        {
          description: "user id format is invalid",
          userId: "abc123",
          expectedStatusCode: 400,
          expectedMessage: "invalid user ID format",
        },
      ])(
        "should return $expectedStatusCode when $description",
        async ({ userId, expectedStatusCode, expectedMessage }) => {
          const response = await request(app).get(`/${userId}`).send();

          expect(response.status).toBe(expectedStatusCode);
          expect(response.body.message).toEqual(expectedMessage);
        },
      );
    });

    describe("Error handling", () => {
      it("should return 500 when server error occurs", async () => {
        jest.spyOn(User, "findOne").mockImplementationOnce(() => {
          throw new Error("Fail on findOne");
        });

        const response = await request(app)
          .get(`/6527ed7b9b0a1a3c9b0d02a5`)
          .send();

        expect(response.status).toBe(500);
        expect(response.body.message).toEqual("internal server error");
      });
    });
  });

  describe("Subscribe/Unsubscribe", () => {
    let token: string;
    let currentUser: any;
    let newUser: any;
    beforeAll(async () => {
      let response = await request(app)
        .post("/login")
        .send({ username: mockUsername, password: "NewValid1@password" });

      token = response.body.token;
      await request(app)
        .post("/register")
        .send({ username: mockUsernameForSub, password: mockPassword });
      currentUser = await User.findOne({ username: mockUsername });
      newUser = await User.findOne({ username: mockUsernameForSub });
    });

    describe("POST /:id/subscribe", () => {
      it("should return 200 when it successfully subscribe to a new user", async () => {
        const response = await request(app)
          .post(`/${newUser._id}/subscribe`)
          .set("token", token)
          .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          subscribedTo: {
            username: newUser.username,
            _id: newUser._id.toString(),
            followerCount: newUser.followerCount + 1,
          },
          message: "success",
        });
      });

      describe("Failed subscribe", () => {
        it.each([
          {
            description: "trying to subscribe to itself",
            userId: () => currentUser?._id.toString(),
            expectedStatusCode: 400,
            expectedMessage: "cannot subscribe to itself",
          },
          {
            description: "user id format is invalid",
            userId: () => "abc123",
            expectedStatusCode: 400,
            expectedMessage: "invalid user ID format",
          },
          {
            description: "user does not exist",
            userId: () => "6527ed7b9b0a1a3c9b0d02a5",
            expectedStatusCode: 400,
            expectedMessage: "cannot subscribe to a non existing user",
          },
        ])(
          "should return $expectedStatusCode when $description",
          async ({ userId, expectedStatusCode, expectedMessage }) => {
            const response = await request(app)
              .post(`/${userId()}/subscribe`)
              .set("token", token)
              .send();

            expect(response.status).toBe(expectedStatusCode);
            expect(response.body.message).toBe(expectedMessage);
          },
        );
      });

      describe("Error handling", () => {
        it("should return 500 when server error occured", async () => {
          jest.spyOn(User, "findOne").mockImplementationOnce(() => {
            throw new Error("Server error");
          });

          const response = await request(app)
            .post(`/${newUser._id}/subscribe`)
            .set("token", token)
            .send();

          expect(response.status).toBe(500);
          expect(response.body.message).toEqual("internal server error");
        });
      });
    });

    describe("DELETE /:id/unsubscribe", () => {
      it("should return 200 when it successfully unsubscribe", async () => {
        const response = await request(app)
          .delete(`/${newUser._id}/unsubscribe`)
          .set("token", token)
          .send();

        console.log("response.body", response.body);
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("success");
      });

      describe("Failed unsubscribe", () => {
        it.each([
          {
            description: "trying to unsubscribe to itself",
            userId: () => currentUser?._id.toString(),
            expectedStatusCode: 400,
            expectedMessage: "cannot unsubscribe to itself",
          },
          {
            description: "user id format is invalid",
            userId: () => "abc123",
            expectedStatusCode: 400,
            expectedMessage: "invalid user ID format",
          },
          {
            description: "unsubscribing ",
            userId: () => "6527ed7b9b0a1a3c9b0d02a5",
            expectedStatusCode: 404,
            expectedMessage: "you are not subscribed to this user",
          },
        ])(
          "should return $expectedStatusCode when $description",
          async ({ userId, expectedStatusCode, expectedMessage }) => {
            const response = await request(app)
              .delete(`/${userId()}/unsubscribe`)
              .set("token", token)
              .send();

            expect(response.status).toBe(expectedStatusCode);
            expect(response.body.message).toBe(expectedMessage);
          },
        );
      });

      describe("Error handling", () => {
        it("should return 500 when server error occured", async () => {
          //subscribe first
          await request(app)
            .post(`/${newUser._id}/subscribe`)
            .set("token", token)
            .send();

          jest.spyOn(User, "findByIdAndUpdate").mockImplementationOnce(() => {
            throw new Error("Server error");
          });

          const response = await request(app)
            .delete(`/${newUser._id}/unsubscribe`)
            .set("token", token)
            .send();

          expect(response.status).toBe(500);
          expect(response.body.message).toEqual("internal server error");
        });
      });
    });
  });
});
