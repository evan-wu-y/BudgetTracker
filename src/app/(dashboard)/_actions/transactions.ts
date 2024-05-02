"use server";

import { prisma } from "@/lib/prisma";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transation";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { amount, description, date, category, type } = parsedBody.data;
  const categoryRow = await prisma.category.findFirst({
    where: {
      name: category,
      userId: user.id,
    },
  });

  if (!categoryRow) {
    throw new Error("Category not found");
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        description: description || "",
        date,
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
      },
    }),

    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
          userId: user.id,
        },
      },
      create: {
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        userId: user.id,
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),

    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
          userId: user.id,
        },
      },
      create: {
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        userId: user.id,
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),
  ]);
}
