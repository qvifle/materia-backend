import { PrismaClient } from "@prisma/client";
import { Router } from "express";
// import isIncludesById from "../utils/helpers/isIncludesById";

const router = Router();
const prisma = new PrismaClient();

// accept invite by recipient

// get my where me invited
router.get("/", async (req, res) => {
  const { jwtData } = req.body;
  const user = await prisma.user.findFirst({
    where: { id: jwtData.id },
    include: {
      receivedInvites: {
        include: {
          project: true,
          sender: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    res.status(500).send("User not found");
    return;
  }

  res.status(200).json(user.receivedInvites);
});

router.delete("/leave-project/:projectId", async (req, res) => {
  const { jwtData } = req.body;
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400).send("Project id required");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: jwtData.id,
    },
    include: { memberProjects: true },
  });

  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  if (!user.memberProjects || !user.memberProjects.length) {
    res.status(404).send("Project doesnt take part of any project");
    return;
  }

  // if (!isIncludesById(user.memberProjects, projectId)) {
  //   res.status(404).send("User doesnt take part of this project");
  //   return;
  // }

  const deleteProjectRes = await prisma.user.update({
    where: {
      id: jwtData.id,
    },
    data: {
      memberProjects: {
        disconnect: { id: projectId },
      },
    },
  });

  if (!!deleteProjectRes) {
    res.send("Successfully left from project").status(200);
  } else {
    res.send("Somethin went wrong").status(500);
  }
});

// get invites to this project
router.get("/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const invites = await prisma.invite.findMany({
    where: { projectId },
    include: {
      project: true,
      recipient: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json(invites);
});

// send invite
router.post("/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const { recipientEmail, jwtData: sender } = req.body;

  if (!recipientEmail || !sender) {
    res.status(400).send("Fill all fields");
    return;
  }

  const recipient = await prisma.user.findFirst({
    where: { email: recipientEmail },
    include: { memberProjects: true, receivedInvites: true },
  });

  if (!recipient) {
    res.status(404).send("Invited user not found");
    return;
  }

  const isAlreadyMember = !!recipient.memberProjects.find(
    (project: any) => project.id === projectId
  );

  if (isAlreadyMember) {
    res.status(409).send("User already member");
    return;
  }

  const isAlreadyInvited = !!recipient.receivedInvites.find(
    (invite: any) => invite.projectId === projectId
  );

  if (isAlreadyInvited) {
    res.status(409).send("Invite already sent to this user");
    return;
  }

  await prisma.invite.create({
    data: {
      senderId: sender.id,
      recipientId: recipient.id,
      projectId,
    },
  });

  // ws send invite

  res.status(200).send("Invite sent!");
});

// accept invite
router.patch("/:inviteId/accept", async (req, res) => {
  const { jwtData } = req.body;
  const { inviteId } = req.params;

  const user = await prisma.user.findFirst({
    where: { id: jwtData.id },
    include: { receivedInvites: true },
  });

  if (!user) {
    res.status(500).send("User not found");
    return;
  }

  const invite = user.receivedInvites.find(
    (invite: any) => invite.id === inviteId
  );

  if (!invite) {
    res.status(404).send("Invite not found");
    return;
  }

  await prisma.project.update({
    where: { id: invite.projectId },
    data: { members: { connect: { id: user.id } } },
  });

  await prisma.invite.delete({ where: { id: inviteId } });

  res.status(200).send("Invite accepted");
});

// reject where me invited
router.delete("/:inviteId/reject", async (req, res) => {
  const { jwtData } = req.body;
  const { inviteId } = req.params;

  const user = await prisma.user.findFirst({
    where: { id: jwtData.id },
    include: { receivedInvites: true, sentInvites: true },
  });

  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  const invite = user.receivedInvites.find(({ id }: any) => id === inviteId);

  if (!invite) {
    res.status(404).send("Invite not found");
    return;
  }

  await prisma.invite.delete({
    where: {
      id: inviteId,
    },
  });

  res.status(200).send("Invite rejected");
});

// cancel by sender
router.delete("/:inviteId", async (req, res) => {
  const { jwtData: senderJWT } = req.body;
  const { inviteId } = req.params;

  const sender = await prisma.user.findFirst({
    where: { id: senderJWT.id },
    include: { sentInvites: true },
  });

  if (!sender) {
    res.status(500).send("User not found");
    return;
  }

  const invite = sender.sentInvites.find(({ id }: any) => id === inviteId);

  if (!invite) {
    res.status(403).send("You cant reject invite");
    return;
  }

  await prisma.invite.delete({
    where: {
      id: invite.id,
    },
  });

  res.status(200).send("Invite rejected!");
});

export default router;
