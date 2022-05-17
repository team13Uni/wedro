import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import cron from "./cron";

import { errorMiddleware } from "./middlewares";
import { downscaleData } from "./modules/measurement";

require("dotenv").config();

const app = express();

cron();
app.set("port", process.env.PORT);
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose
  .connect(
    `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.vjg7h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((err) => {
    console.log("🆘 Error occured: " + err.message);
    process.exit(1);
  });

require("./routes")(app);

// Handle 404 errors
app.use(errorMiddleware);

app.listen(app.get("port"), async () => {
  console.log(`✅ Server is running on port ${app.get("port")}`);

  const data = await downscaleData("hour");
  console.log(data);
});
