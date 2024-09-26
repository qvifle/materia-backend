import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { Router } from "express";
import generateTokens from "../utils/helpers/generateTokens.js";

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

    const { accessToken, refreshToken } = generateTokens({
      id: existedUser.id,
      name: existedUser.name,
      email: existedUser.email,
    });

    const { id, password: existedUserPassword, ...userData } = existedUser;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      domain: domain,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      domain: domain,
    });
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).send("Something went wrong");
    throw err;
  }
});
export default signInRouter;
