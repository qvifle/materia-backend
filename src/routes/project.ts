import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import isMember from "../middlewares/isMember.js";

const router = Router();
const prisma = new PrismaClient();

// Get all user's project
router.get("/", async (req, res) => {
  const userId = req.body.jwtData.id;

  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },

      include: {
        creator: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!projects) {
      res.status(500).send("Something went wrong");
    }
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).send("Somehting went wrong");
    throw err;
  }
});

// d40575ad-f584-4036-9f48-520953fb40ae

// Get project by id
router.get("/:projectId", isMember, async (req, res) => {
  try {
    const userId = req.body.jwtData.id;
    const projectId = req.params.projectId;
    const withDesks = req.query.withDesks === "y";
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        desks: withDesks,
        creator: {
          select: {
            email: true,
            id: true,
          },
        },
        members: true,
      },
    });

    res.json(project).status(200);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Create new project
router.post("/", async (req, res) => {
  try {
    const userId = req.body.jwtData.id;
    const { title, description, iconUrl } = req.body;
    if (!title) {
      res.status(401).send("Title is required field");
      return;
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        iconUrl,
        creatorId: userId,
        members: { connect: { id: userId } },
      },
    });

    if (!newProject) {
      res.status(500).send("Something went wrong with db");
    }

    res.status(201).json(newProject);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(408).send("This project name is already used");
      return;
    }
    res.status(500).send("Something went wrong");
    console.log(err);
  }
});

// Change title, description or iconUrl of Project
router.put("/:projectId", isMember, async (req, res) => {
  try {
    const { title, description, iconUrl } = req.body;

    const newProject = await prisma.project.update({
      data: { title, description, iconUrl },
      where: { id: req.params.projectId },
    });

    res.json(newProject).status(200);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(408).send("This project name is already used");
      return;
    }
    res.status(500).send("Something went wrong");
  }
});

// Delete project
router.delete("/:projectId", isMember, async (req, res) => {
  try {
    const { projectId } = req.params;

    await prisma.project.delete({
      include: {
        desks: true,
      },
      where: {
        id: projectId,
      },
    });

    res.status(202).send("Project sucessfuly deleted");
  } catch (err) {
    res.status(500).send("Something went Wrong");
    console.error(err);
  }
});

router.get("/:projectId/members", async (req, res) => {
  const { projectId } = req.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: {
      members: {
        select: {
          email: true,
          name: true,
          id: true,
        },
      },
    },
  });

  if (!project) {
    res.status(404).send("Project not found");
    return;
  }

  const { members, creatorId } = project;
  res.status(200).send({ members, creatorId });
});

// Remove member from project
router.delete("/:projectId/remove", async (req, res) => {
  try {
    const { memberId } = req.body;
    const projectId = req.params.projectId;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
    });

    res.status(200).send("Member removed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went Wrong");
  }
});

export default router;
