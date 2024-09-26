import { Router } from "express";
import jwt from "jsonwebtoken";

const domain = process.env.DOMAIN;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;

const refreshTokenRouter = Router();

refreshTokenRouter.post("/", (req, res) => {
  try {
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
      res.status(500).send("Env not provided");
      return;
    }
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).send("Refresh token is not provided");
      return;
    }

    const user: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    if (!user) {
      res.status(401).send("Refresh token not verified");
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES,
      }
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default refreshTokenRouter;
