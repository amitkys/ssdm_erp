export const userRoleValues = ["superAdmin", "admin", "student"] as const;

export type UserRole = (typeof userRoleValues)[number];
