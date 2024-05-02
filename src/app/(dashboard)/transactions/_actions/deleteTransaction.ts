"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteTransaction(id: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  await prisma.$transaction([
    prisma.transaction.delete({
      where: {
        userId: user.id,
        id,
      },
    }),

    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          year: transaction.date.getUTCFullYear(),
          month: transaction.date.getUTCMonth(),
          day: transaction.date.getUTCDate(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),

    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          year: transaction.date.getUTCFullYear(),
          month: transaction.date.getUTCMonth(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ]);
}
