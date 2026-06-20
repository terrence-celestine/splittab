import { db } from "../db";
import { tabs } from "../db/schema";
import { eq } from "drizzle-orm";

function generate(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export async function generateRoomCode(): Promise<string> {
  let code = generate();
  let existing = await db.select().from(tabs).where(eq(tabs.roomCode, code));

  while (existing.length > 0) {
    code = generate();
    existing = await db.select().from(tabs).where(eq(tabs.roomCode, code));
  }

  return code;
}
