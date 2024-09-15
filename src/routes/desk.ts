import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import isMember from "../middlewares/isMember.js";

const router = Router();
const prisma = new PrismaClient();

//get all desk of current project
router.get("/:projectId", isMember, async (req, res) => {
  try {
    const desks = await prisma.desk.findMany({
      where: {
        projectId: req.params.projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        tasks: {
          orderBy: {
            orderId: "asc",
          },
        },
      },
    });

    if (desks.length < 1) {
      res.json([]).status(204);
      return;
    }

    res.json(desks).status(200);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

// create new desk
router.post("/:projectId", isMember, async (req, res) => {
  try {
    const { title, color } = req.body;
    const newDesk = await prisma.desk.create({
      data: { title, color, projectId: req.params.projectId },
    });

    if (!newDesk) {
      throw new Error("Empty desk");
    }

    res.json(newDesk).status(201);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(408).send("This desk name is already used in this project");
      return;
    }
    res.status(500).send("Something went wrong");
  }
});

// Change title, color of desk
router.put("/:deskId", async (req, res) => {
  try {
    const { title, color } = req.body;

    const newDesk = await prisma.desk.update({
      data: { title, color },
      where: { id: req.params.deskId },
    });

    res.json(newDesk).status(200);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(408).send("This desk name is already used in this project");
      return;
    }
    res.status(500).send("Something went wrong");
  }
});

// Delete desk
router.delete("/:deskId", async (req, res) => {
  try {
    const deskId = req.params.deskId;

    await prisma.desk.delete({
      where: { id: deskId },
    });

    res.status(202).send("Desk successfully deleted");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

export default router;
