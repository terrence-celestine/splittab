import { Router, Response } from "express";
import { db } from "../db";
import { expenses, expenseSplits, tabMembers, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { io } from "../index";

const router = Router({ mergeParams: true });

// POST /tabs/:id/expenses
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const tabId = req.params.id as string;
  const userId = req.userId!;
  const { description, amount, category, splitWith } = req.body;

  if (!description || !amount || !splitWith?.length) {
    res
      .status(400)
      .json({ error: "description, amount, and splitWith are required" });
    return;
  }

  // verify requester is a tab member
  const members = await db
    .select()
    .from(tabMembers)
    .where(eq(tabMembers.tabId, tabId));
  const isMember = members.some((m) => m.userId === userId);
  if (!isMember) {
    res.status(403).json({ error: "You are not a member of this tab" });
    return;
  }

  // insert expense
  const [expense] = await db
    .insert(expenses)
    .values({
      tabId,
      paidBy: userId,
      description,
      amount: String(amount),
      category: category ?? "other",
    })
    .returning();

  // calculate equal split
  const splitAmount = (parseFloat(amount) / splitWith.length).toFixed(2);

  // insert splits
  await db.insert(expenseSplits).values(
    splitWith.map((uid: string) => ({
      expenseId: expense.id,
      userId: uid,
      amount: splitAmount,
    })),
  );
  io.to(tabId).emit("expense-added", { expense });
  res.status(201).json({ expense });
});

// GET /tabs/:id/expenses
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const tabId = req.params.id as string;
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

  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.tabId, tabId));

  const result = await Promise.all(
    rows.map(async (expense) => {
      const splits = await db
        .select()
        .from(expenseSplits)
        .where(eq(expenseSplits.expenseId, expense.id));
      const [paidByUser] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, expense.paidBy));
      return { ...expense, paidByUser, splits };
    }),
  );

  res.json({ expenses: result });
});

// GET /tabs/:id/balances
router.get(
  "/balances",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const tabId = req.params.id as string;
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

    const rows = await db
      .select()
      .from(expenses)
      .where(eq(expenses.tabId, tabId));

    // net balance map: positive = owed money, negative = owes money
    const balances: Record<string, number> = {};
    members.forEach((m) => (balances[m.userId] = 0));

    for (const expense of rows) {
      const splits = await db
        .select()
        .from(expenseSplits)
        .where(eq(expenseSplits.expenseId, expense.id));
      balances[expense.paidBy] += parseFloat(expense.amount);
      for (const split of splits) {
        balances[split.userId] -= parseFloat(split.amount);
      }
    }

    // attach names
    const memberDetails = await Promise.all(
      members.map(async (m) => {
        const [user] = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(eq(users.id, m.userId));
        return { ...user, balance: parseFloat(balances[m.userId].toFixed(2)) };
      }),
    );

    res.json({ balances: memberDetails });
  },
);

export default router;
