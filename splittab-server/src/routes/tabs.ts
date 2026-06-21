import { Router, Response } from "express";
import { db } from "../db";
import { tabs, tabMembers, users } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { generateRoomCode } from "../lib/roomCode";
import { io } from "../index";

const router = Router({ mergeParams: true });

// POST /tabs — create a tab
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.userId!;

  if (!name) {
    res.status(400).json({ error: "Tab name is required" });
    return;
  }

  const roomCode = await generateRoomCode();

  const [tab] = await db
    .insert(tabs)
    .values({
      name,
      roomCode,
      createdBy: userId,
    })
    .returning();

  await db.insert(tabMembers).values({
    tabId: tab.id,
    userId,
  });

  io.to(tab.id).emit("tab-created", { tab });
  res.status(201).json({ tab });
});

// POST /tabs/join — join by room code
router.post("/join", requireAuth, async (req: AuthRequest, res: Response) => {
  const { roomCode } = req.body;
  const userId = req.userId!;

  if (!roomCode) {
    res.status(400).json({ error: "Room code is required" });
    return;
  }

  const [tab] = await db
    .select()
    .from(tabs)
    .where(eq(tabs.roomCode, roomCode.toUpperCase()));
  if (!tab) {
    res.status(404).json({ error: "Tab not found" });
    return;
  }

  const existing = await db
    .select()
    .from(tabMembers)
    .where(eq(tabMembers.tabId, tab.id));

  const alreadyMember = existing.some((m) => m.userId === userId);
  if (alreadyMember) {
    res.status(409).json({ error: "Already a member of this tab" });
    return;
  }

  await db.insert(tabMembers).values({ tabId: tab.id, userId });

  io.to(tab.id).emit("tab-joined", { tab });
  res.json({ tab });
});

// DELETE /tabs/:id/leave
router.delete(
  "/:tabId/leave",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const tabId = req.params.tabId as string;
    const userId = req.userId!;

    const members = await db
      .select()
      .from(tabMembers)
      .where(eq(tabMembers.tabId, tabId));
    const isMember = members.some((m) => m.userId === userId);
    if (!isMember) {
      res.status(403).json({ error: "You are not a member of this tab" });
      return;
    }

    if (members.length === 1) {
      res
        .status(400)
        .json({ error: "You are the only member. Delete the tab instead." });
      return;
    }

    await db
      .delete(tabMembers)
      .where(and(eq(tabMembers.tabId, tabId), eq(tabMembers.userId, userId)));

    io.to(tabId).emit("member-left", { userId, tabId });

    res.json({ message: "Left tab successfully" });
  },
);

// GET /tabs/:id — fetch tab + members
router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const userId = req.userId!;

  const [tab] = await db.select().from(tabs).where(eq(tabs.id, id));
  if (!tab) {
    res.status(404).json({ error: "Tab not found" });
    return;
  }

  const membership = await db
    .select()
    .from(tabMembers)
    .where(eq(tabMembers.tabId, id));

  const isMember = membership.some((m) => m.userId === userId);
  if (!isMember) {
    res.status(403).json({ error: "You are not a member of this tab" });
    return;
  }

  const memberIds = membership.map((m) => m.userId);
  const members = await Promise.all(
    memberIds.map((uid) =>
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, uid))
        .then((rows) => rows[0]),
    ),
  );

  res.json({ tab, members });
});

export default router;
