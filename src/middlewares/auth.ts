import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!ACCESS_TOKEN_SECRET) {
      res.status(500).send("Env not provided");
      return;
    }
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      res.status(401).send("You are not logged in!");
      return;
    }

    const accesToken = authorizationHeader.split(" ")[1];

    const user = jwt.verify(accesToken, ACCESS_TOKEN_SECRET);
    req.body.jwtData = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: err });
  }
};

export default auth;
