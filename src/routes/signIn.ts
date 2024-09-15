import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { Router } from "express";
import getAccessToken from "../utils/helpers/getAccessToken.js";

const domain = process.env.DOMAIN;
const signInRouter = Router();
const prisma = new PrismaClient();

// login
signInRouter.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Fill all fields");
    }

    const existedUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!existedUser) {
      return res.status(404).send("User doesnt exist");
    }

    const isValidPassword = await compare(password, existedUser.password);
    if (!isValidPassword) {
      return res.status(401).send("Password doesnt match");
    }

    const accesToken = getAccessToken({
      id: existedUser.id,
      name: existedUser.name,
      email: existedUser.email,
    });

    const { id, password: existedUserPassword, ...userData } = existedUser;

    res
      .cookie("accessToken", accesToken, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        path: "/",
        domain: domain, //replace
      })
      .status(200)
      .json(userData);
  } catch (err) {
    res.status(500).send("Something went wrong");
    throw err;
  }
});
export default signInRouter;
