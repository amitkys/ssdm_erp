import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { userRoleValues } from "@/lib/auth-role";
import { db } from "@/lib/db"; // your drizzle instance
import * as authSchema from "@/lib/db/schema/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: authSchema,
  }),
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    process.env.NEXT_PUBLIC_APP_URL!,
    "https://santsandhyadasmahilacollege.org",
    "https://www.santsandhyadasmahilacollege.org",
    // www variant: https://domain.com → https://www.domain.com
    process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace("://", "://www.")
      : "",
  ].filter(Boolean),
  emailAndPassword: { enabled: true, autoSignIn: false },
  user: {
    additionalFields: { role: { type: [...userRoleValues], required: true } },
  },
});
