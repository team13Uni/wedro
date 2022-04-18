import express, {
  Request,
  ErrorRequestHandler,
  Response,
  NextFunction,
} from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import cron from "./cron";

import ErrorCodes from "./types/errorCodes";

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

require("./routes/index.routes")(app);

// Handle 404 errors
app.use(function (
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  res.status(404).send({
    messages: {
      cs: "Cesta kterou jste zadali nebyla nelezena!",
      en: "Unable to find the requested resource!",
    },
    code: ErrorCodes.ROUTE_NOT_FOUND,
  });
});

app.listen(app.get("port"), () => {
  console.log(`✅ Server is running on port ${app.get("port")}`);
});
