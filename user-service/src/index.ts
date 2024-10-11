import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route";
import helmet from "helmet";

const app = express();

async function bootstrap(): Promise<void> {
  try {
    console.log("bootstrapping");
    const connectString = process.env.MONGO_URI || "test";

    await mongoose.connect(connectString);

    console.log("bootstrap done...");
  } catch (err) {
    console.error("error during bootstrapping", err);
    process.exit(1);
  }
}

bootstrap().then(() => {
  app.use(express.json());
  app.use(helmet());
  app.use(helmet.xssFilter());
  app.use("/users", userRoutes);
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`server running on port ${port}`));
});
