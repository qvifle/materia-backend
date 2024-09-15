import { PrismaClient } from "@prisma/client";
import { Router } from "express";
const router = Router();
const prisma = new PrismaClient();
router.get("/", (req, res) => {
    // const tasks = prisma.task.findMany({ where: { id: "df" } });
    res.status(400).send("Hello you right");
});
export default router;
//# sourceMappingURL=test.js.map