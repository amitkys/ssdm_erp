"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { admissionOpenTable, batchTable } from "@/lib/db/schema";
import {
  type AddAdmissionOpenSchema,
  addAdmissionOpenSchema,
  type UpdateAdmissionOpenSchema,
  updateAdmissionOpenSchema,
} from "./zod-type/admission-open-type";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return { success: false as const, message: "Forbidden" };
  }

  return { success: true as const, data: session };
}

export async function getAdmissionOpens() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const data = await db.query.admissionOpenTable.findMany({
      orderBy: [
        desc(admissionOpenTable.updatedAt),
        desc(admissionOpenTable.createdAt),
      ],
      with: { batch: { with: { course: true, academicSession: true } } },
    });

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch admission open records",
    };
  }
}

export async function addAdmissionOpen(input: AddAdmissionOpenSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addAdmissionOpenSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid admission open details" };
    }

    const [record] = await db
      .insert(admissionOpenTable)
      .values({
        batchId: parsedInput.data.batchId,
        startDate: parsedInput.data.startDate,
        endDate: parsedInput.data.endDate,
        lateFee: parsedInput.data.lateFee,
        isDateExtended: parsedInput.data.isDateExtended,
        extendedDate: parsedInput.data.extendedDate || null,
      })
      .returning();

    return { success: true, data: record };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add admission open record",
    };
  }
}

export async function updateAdmissionOpen(input: UpdateAdmissionOpenSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = updateAdmissionOpenSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid admission open details" };
    }

    const {
      id,
      batchId,
      startDate,
      endDate,
      lateFee,
      isDateExtended,
      extendedDate,
    } = parsedInput.data;

    const [record] = await db
      .update(admissionOpenTable)
      .set({
        batchId,
        startDate,
        endDate,
        lateFee,
        isDateExtended,
        extendedDate: extendedDate || null,
        updatedAt: new Date(),
      })
      .where(eq(admissionOpenTable.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Admission open record not found" };
    }

    return { success: true, data: record };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update admission open record",
    };
  }
}

export async function deleteAdmissionOpen(id: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const [record] = await db
      .delete(admissionOpenTable)
      .where(eq(admissionOpenTable.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Admission open record not found" };
    }

    return { success: true, data: record };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete admission open record",
    };
  }
}

export async function getBatches() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const batches = await db.query.batchTable.findMany({
      orderBy: [desc(batchTable.createdAt)],
      with: { course: true, academicSession: true },
    });

    return { success: true, data: batches };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch batches",
    };
  }
}
