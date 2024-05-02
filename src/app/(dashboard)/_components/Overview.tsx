"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserSettings } from "@prisma/client";
import { differenceInDays, format, startOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import CategoriesStats from "./CategoriesStats";
import StatsCards from "./StatsCards";

function Overview({ userSettings }: { userSettings: UserSettings }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <>
      <div className="container flex flex-wrap items-end justify-between gap-2 py-6">
        <h2 className="text-3xl font-bold">Overciew</h2>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                numberOfMonths={2}
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(v) => {
                  if (!v) {
                    return;
                  }

                  if (differenceInDays(v.to!, v.from!) > MAX_DATE_RANGE_DAYS) {
                    toast.error(
                      `Max date range is ${MAX_DATE_RANGE_DAYS} days`,
                    );
                    return;
                  }

                  setDateRange(v);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="container flex w-full flex-col gap-2">
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from!}
          to={dateRange.to!}
        />
        <CategoriesStats
          from={dateRange.from!}
          to={dateRange.to!}
          userSettings={userSettings}
        />
      </div>
    </>
  );
}

export default Overview;
