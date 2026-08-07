import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema/auth-schema";

async function resetPassword(emailOrRollNo: string, newPassword: string) {
  // 1. Find the user by email (or roll number email pattern: rollno@student.ssdm.local)
  const targetUser = await db.query.user.findFirst({
    where: eq(user.email, emailOrRollNo),
  });

  if (!targetUser) {
    console.error(`❌ User not found with email: ${emailOrRollNo}`);
    process.exit(1);
  }

  // 2. Hash the new password using Better Auth's hashing algorithm (scrypt)
  const hashedPassword = await hashPassword(newPassword);

  // 3. Update the password in the account table
  await db
    .update(account)
    .set({ password: hashedPassword })
    .where(eq(account.userId, targetUser.id));

  console.log(`✅ Successfully updated password for ${targetUser.email}`);
  process.exit(0);
}

// Pass target user's email and desired new password
const userEmail = process.argv[2];
const newPassword = process.argv[3];

if (!userEmail || !newPassword) {
  console.log("Usage: bun run scratch/reset-password.ts <email> <newPassword>");
  process.exit(1);
}

resetPassword(userEmail, newPassword);
