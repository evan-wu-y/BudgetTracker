import { prisma } from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
  timeframe: z.enum(["month", "year"]),
  year: z.coerce.number().min(2000).max(2099),
  month: z.coerce.number().min(0).max(11).default(0),
});

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const queryParams = getHistoryDataSchema.safeParse({
    timeframe,
    year,
    month,
  });
  if (!queryParams.success) {
    return Response.json(queryParams.error.message, { status: 400 });
  }
  const historyData = await getHistoryData(
    user.id,
    queryParams.data.timeframe,
    {
      year: Number(queryParams.data.year),
      month: Number(queryParams.data.month),
    },
  );
  return Response.json(historyData);
}

export type GetHistoryDataResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;
async function getHistoryData(
  userId: string,
  timeframe: Timeframe,
  period: Period,
) {
  switch (timeframe) {
    case "month":
      return await getMonthlyHistory(userId, period.year, period.month);
    case "year":
      return await getYearlyHistory(userId, period.year);
  }
}

type HistoryData = {
  income: number;
  expense: number;
  year: number;
  month: number;
  day?: number;
};
async function getYearlyHistory(userId: string, year: number) {
  const result = await prisma.yearHistory.groupBy({
    by: ["month"],
    where: {
      userId,
      year,
    },
    _sum: {
      income: true,
      expense: true,
    },
    orderBy: {
      month: "asc",
    },
  });
  if (!result || result.length === 0) {
    return [];
  }

  const history: HistoryData[] = [];
  for (let i = 0; i < 12; i++) {
    let expense = 0;
    let income = 0;
    const month = result.find((r) => r.month === i);
    if (month) {
      expense = month._sum.expense || 0;
      income = month._sum.income || 0;
    }
    history.push({
      income,
      expense,
      year,
      month: i,
    });
  }

  return history;
}

async function getMonthlyHistory(userId: string, year: number, month: number) {
  const result = await prisma.monthHistory.groupBy({
    by: ["day"],
    where: {
      userId,
      year,
      month,
    },
    _sum: {
      income: true,
      expense: true,
    },
    orderBy: {
      day: "asc",
    },
  });
  if (!result || result.length === 0) {
    return [];
  }

  const history: HistoryData[] = [];

  const daysInMonth = getDaysInMonth(new Date(year, month));

  for (let i = 1; i <= daysInMonth; i++) {
    let expense = 0;
    let income = 0;
    const day = result.find((r) => r.day === i);
    if (day) {
      expense = day._sum.expense || 0;
      income = day._sum.income || 0;
    }
    history.push({
      income,
      expense,
      year,
      month,
      day: i,
    });
  }

  return history;
}
