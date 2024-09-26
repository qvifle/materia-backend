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
import refreshTokenRouter from "./routes/refreshToken.js";

const port = process.env.PORT;

const allowedOrigins = ["http://localhost:3000", "https://mateeria.ru"];

const app = Express();
app.use(Express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE,PATCH", // Allowed methods
    credentials: true, // Allow cookies if needed
  })
);

const apiRouter = Router();

apiRouter.use(cookieParser());
apiRouter.use("/signUp", signUpRouter);
apiRouter.use("/signIn", signInRouter);
apiRouter.use("/refresh", refreshTokenRouter);

apiRouter.use(auth);

apiRouter.use("/projects", project);
apiRouter.use("/desks", desk);
apiRouter.use("/tasks", task);
apiRouter.use("/invites", invite);

app.use("/api/v1", apiRouter);

app.listen(port, () => {
  console.log(`Server started on ${port} port`);
});
