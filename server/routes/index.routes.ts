import { Application, Request, Response, Router } from "express";

const router = Router();
router.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

export = (app: Application) => {
  app.use("/api", router);
};
