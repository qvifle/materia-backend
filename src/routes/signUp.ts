import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import hashPassword from "../utils/helpers/hashPassword.js";

const prisma = new PrismaClient();
const signUpRouter = Router();

// registration
signUpRouter.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send("Fill all fields");
    }

    const existUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!!existUser) {
      return res.status(401).send("This email addres already used");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (!newUser) {
      return res.status(500).send("Error while creating user");
    }

    res
      .status(201)
      .send("New User successfully created");
  } catch (err) {
    res.status(500).send("Something went wrong");
    throw err;
  }
});

export default signUpRouter;
