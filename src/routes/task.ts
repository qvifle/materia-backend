import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

// Get all tasks by desk id
router.get("/:deskId", async (req, res) => {
  try {
    const deskId = req.params.deskId;
    const desk = await prisma.desk.findFirst({ where: { id: deskId } });
    if (!desk) {
      res.status(404).send("Desk not found");
      return;
    }

    const tasks = await prisma.task.findMany({
      where: {
        deskId: deskId,
      },
      orderBy: {
        orderId: "asc",
      },
    });

    res.json(tasks).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

// Create new task by desk id
router.post("/:deskId", async (req, res) => {
  const { title, description } = req.body;
  try {
    const deskId = req.params.deskId;
    const desk = await prisma.desk.findFirst({
      where: { id: deskId },
      include: { tasks: true },
    });
    if (!desk) {
      res.status(404).send("Desk not found");
      return;
    }
    const taskOrderId = desk.tasks.length;

    const newTask = await prisma.task.create({
      data: {
        title: title,
        description: description,
        deskId: deskId,
        orderId: taskOrderId,
      },
    });

    res.status(201).json(newTask);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(408).send("This task name is already used in this project");
      return;
    }
    res.status(500).send("Something went wrong");
    console.error(err);
  }
});

// Edit task by task id
router.put("/:taskId", async (req, res) => {
  try {
    const { title, description } = req.body;
    const taskId = req.params.taskId;
    const task = await prisma.task.findFirst({ where: { id: taskId } });
    if (!task) {
      res.send("Task not found").status(404);
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { title, description },
    });

    res.json(updatedTask).status(200);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(408).send("This task name is already used in this project");
      return;
    }
    res.status(500).send("Something went wrong");
    console.error(err);
  }
});

router.patch("/priority/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await prisma.task.findFirst({ where: { id: taskId } });

    if (!task) {
      res.send("Task not found").status(404);
      return;
    }

    const { priority } = req.body;

    const patchedTask = await prisma.task.update({
      where: { id: taskId },
      data: { priority },
    });

    res.json(patchedTask).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

// change order id
router.patch("/order/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    // const newTaskOrderId = req.body.newOrderId;
    const overTaskId = req.body.overTaskId;

    if (overTaskId === undefined) {
      res.status(400).send("newTaskOrderId is required");
      return;
    }

    const task = await prisma.task.findFirst({ where: { id: taskId } });
    if (!task) {
      res.status(404).send("This task doesn't exist");
      return;
    }
    const { orderId: oldOrderId, deskId } = task;

    const overTask = await prisma.task.findFirst({ where: { id: overTaskId } });
    if (!overTask) {
      res.status(404).send("OverTask doesnt exists");
      return;
    }

    const { orderId: newOrderId } = overTask;

    // if newOrder id = old, do nothing
    if (oldOrderId === newOrderId) {
      res.status(200).send("New order id same that old");
      return;
    }

    // повышаем ордер айди
    else if (newOrderId > oldOrderId) {
      await prisma.task.updateMany({
        where: {
          deskId: deskId,
          orderId: {
            gte: oldOrderId,
            lte: newOrderId,
          },
        },
        data: { orderId: { decrement: 1 } },
      });
    }

    // опускаем ордер айди
    else {
      await prisma.task.updateMany({
        where: {
          deskId: deskId,
          orderId: {
            lte: oldOrderId,
            gte: newOrderId, // possible
          },
        },
        data: { orderId: { increment: 1 } },
      });
    }

    // обновляем нашу таску
    await prisma.task.update({
      where: { id: taskId },
      data: { orderId: newOrderId },
    });

    res.status(200).send("Order has been changed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Somethinw went wrong");
  }
});

// replace task to another desk.
router.patch("/changeDesk/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const overTaskId = req.body.overTaskId;

    if (!overTaskId) {
      res.send("Fill all fields!").status(400);
      return;
    }

    const task = await prisma.task.findFirst({ where: { id: taskId } });

    if (!task) {
      res.send("Task does not exist").status(404);
      return;
    }

    const { deskId: taskDeskId, orderId: taskOrderId } = task;

    const overTask = await prisma.task.findFirst({ where: { id: overTaskId } });

    if (!overTask) {
      res.send("OverTask does not exist").status(404);
      return;
    }

    const { orderId: overTaskOrderId, deskId: overDeskId } = overTask;

    await prisma.task.updateMany({
      where: {
        deskId: taskDeskId,
        orderId: {
          gt: taskOrderId,
        },
      },
      data: {
        orderId: { decrement: 1 },
      },
    });

    await prisma.task.updateMany({
      where: {
        deskId: overDeskId,
        orderId: {
          gte: overTaskOrderId,
        },
      },
      data: {
        orderId: { increment: 1 },
      },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: { orderId: overTaskOrderId, deskId: overDeskId },
    });

    res.send("Task moved!").status(200);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong").status(500);
  }
});

// replace task to empty desk
router.patch("/addToDesk/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const overDeskId = req.body.overDeskId;

    if (!overDeskId) {
      res.send("Fill all fields!").status(400);
      return;
    }

    const task = await prisma.task.findFirst({ where: { id: taskId } });

    if (!task) {
      res.send("Task does not exist").status(404);
      return;
    }

    const { deskId: taskDeskId, orderId: taskOrderId } = task;

    const overDesk = await prisma.desk.findFirst({
      where: { id: overDeskId },
      include: { tasks: true },
    });

    if (!overDesk) {
      res.send("OverDesk does not exist").status(404);
      return;
    }

    const { tasks } = overDesk;

    await prisma.task.updateMany({
      where: {
        deskId: taskDeskId,
        orderId: {
          gt: taskOrderId,
        },
      },
      data: {
        orderId: { decrement: 1 },
      },
    });

    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        deskId: overDeskId,
        orderId: tasks.length,
      },
    });

    res.send("Task moved!").status(200);
  } catch (err) {
    console.log(err);
    res.send("Something went wrong").status(500);
  }
});

// Delete task
router.delete("/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await prisma.task.findFirst({ where: { id: taskId } });
    if (!task) {
      res.send("Task not found").status(404);
      return;
    }

    await prisma.task.updateMany({
      where: {
        deskId: task.deskId,
        orderId: {
          gt: task.orderId,
        },
      },
      data: {
        orderId: {
          decrement: 1,
        },
      },
    });

    const deletedTask = await prisma.task.delete({ where: { id: taskId } });
    res.json(deletedTask).status(202);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

export default router;
