import { PrismaClient } from "@prisma/client";
import { NextFunction } from "express";
import isIncludesById from "../utils/helpers/isIncludesById.js";

const prisma = new PrismaClient();

const isMember = async (req: any, res: any, next: NextFunction) => {
  const userId = req.body.jwtData.id;
  let projectId = req.params.projectId;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
    include: {
      creator: {
        select: {
          email: true,
          id: true,
        },
      },
      members: true,
    },
  });

  if (!project) {
    res.status(404).send("Project not found");
    return;
  }

  if (
    userId != project?.creator.id &&
    !isIncludesById(project?.members, userId)
  ) {
    res.status(403).send("Access denied");
    return;
  }
  next();
};

export default isMember;
