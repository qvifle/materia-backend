import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const ACCES_TOKEN_SECRET = process.env.ACCES_TOKEN_SECRET || "";

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      res.status(401).send("You are not logged in!");
      return;
    }

    const accesToken = authorizationHeader.split(" ")[1];
    // const isAutheticated = checkAuthentication(accesToken);

    // if (!isAutheticated) {
    //   return res.status(401);
    // }
    const user = jwt.verify(accesToken, ACCES_TOKEN_SECRET);
    req.body.jwtData = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: err });
  }
};

export default auth;
