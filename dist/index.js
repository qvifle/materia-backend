import "dotenv/config";
import Express, { Router } from "express";
import signUpRouter from "./routes/signUp.js";
import signInRouter from "./routes/signIn.js";
import project from "./routes/project.js";
import desk from "./routes/desk.js";
import task from "./routes/task.js";
import invite from "./routes/invite.js";
import auth from "./middlewares/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const port = process.env.PORT || 5000;
const app = Express();
app.use(Express.json());
app.use(cors());
const apiRouter = Router();
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   next();
// });
apiRouter.use(cookieParser());
apiRouter.use("/signUp", signUpRouter);
apiRouter.use("/signIn", signInRouter);
apiRouter.get("/ping", (req, res) => {
    console.log(req);
    res.json("pong").status(200);
});
apiRouter.use(auth);
apiRouter.use("/projects", project);
apiRouter.use("/desks", desk);
apiRouter.use("/tasks", task);
apiRouter.use("/invites", invite);
app.use("/api/v1", apiRouter);
app.listen(port, () => {
    console.log(`Server started on ${port} port`);
});
//# sourceMappingURL=index.js.map