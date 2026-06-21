import { Router, Response } from "express";
import { db } from "../db";
import { expenses, expenseSplits, tabMembers, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { io } from "../index";
import { z } from "zod";

const router = Router({ mergeParams: true });

const addExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum([
    "food",
    "transport",
    "stay",
    "drinks",
    "shopping",
    "other",
  ]),
  splitWith: z
    .array(z.string().uuid())
    .min(1, "Must split with at least one person"),
});

// POST /tabs/:id/expenses
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const tabId = req.params.id as string;
  const userId = req.userId!;

  const result = addExpenseSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }
  const { description, amount, category, splitWith } = result.data;

  const members = await db
    .select()
    .from(tabMembers)
    .where(eq(tabMembers.tabId, tabId));
  const isMember = members.some((m) => m.userId === userId);
  if (!isMember) {
    res.status(403).json({ error: "You are not a member of this tab" });
    return;
  }

  const [expense] = await db
    .insert(expenses)
    .values({
      tabId,
      paidBy: userId,
      description,
      amount: String(amount),
      category,
    })
    .returning();

  const splitAmount = (amount / splitWith.length).toFixed(2);

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

// GET /tabs/:id/expenses/settle
router.get("/settle", requireAuth, async (req: AuthRequest, res: Response) => {
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

  // build net balance map
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

  // debt simplification algorithm
  const settlements: { from: string; to: string; amount: number }[] = [];
  const debtors = Object.entries(balances)
    .filter(([, b]) => b < 0)
    .map(([id, b]) => ({ id, amount: b }));
  const creditors = Object.entries(balances)
    .filter(([, b]) => b > 0)
    .map(([id, b]) => ({ id, amount: b }));

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  // attach names
  const allUsers = await Promise.all(
    members.map((m) =>
      db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, m.userId))
        .then((rows) => rows[0]),
    ),
  );
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]));

  const result = settlements.map((s) => ({
    from: { id: s.from, name: userMap[s.from] },
    to: { id: s.to, name: userMap[s.to] },
    amount: s.amount,
  }));

  res.json({ settlements: result });
});

// PUT /tabs/:id/expenses/:expenseId
router.put(
  "/:expenseId",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const expenseId = req.params.expenseId as string;
    const userId = req.userId!;
    const { description, amount, category, splitWith } = req.body;

    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId));
    if (!expense) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }

    if (expense.paidBy !== userId) {
      res.status(403).json({ error: "Only the payer can edit this expense" });
      return;
    }

    const [updated] = await db
      .update(expenses)
      .set({
        description,
        amount: String(amount),
        category,
      })
      .where(eq(expenses.id, expenseId))
      .returning();

    // delete old splits and re-insert
    await db
      .delete(expenseSplits)
      .where(eq(expenseSplits.expenseId, expenseId));

    const splitAmount = (parseFloat(amount) / splitWith.length).toFixed(2);
    await db.insert(expenseSplits).values(
      splitWith.map((uid: string) => ({
        expenseId,
        userId: uid,
        amount: splitAmount,
      })),
    );

    io.to(expense.tabId).emit("expense-updated", { expense: updated });

    res.json({ expense: updated });
  },
);

// DELETE /tabs/:id/expenses/:expenseId
router.delete(
  "/:expenseId",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const expenseId = req.params.expenseId as string;
    const userId = req.userId!;

    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId));
    if (!expense) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }

    if (expense.paidBy !== userId) {
      res.status(403).json({ error: "Only the payer can delete this expense" });
      return;
    }

    await db
      .delete(expenseSplits)
      .where(eq(expenseSplits.expenseId, expenseId));
    await db.delete(expenses).where(eq(expenses.id, expenseId));

    io.to(expense.tabId).emit("expense-deleted", { expenseId });

    res.json({ message: "Expense deleted" });
  },
);

export default router;
