import { cn } from "@/lib/utils";
import React from "react";
import { Skeleton } from "./ui/skeleton";

function SkeletonWrapper({
  children,
  isLoading,
  fullWidth = true,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  fullWidth?: boolean;
}) {
  if (!isLoading) {
    return children;
  }

  return (
    <Skeleton className={cn(fullWidth && "w-full")}>
      <div className="z-1 relative opacity-0 after:absolute after:inset-0">
        {children}
      </div>
    </Skeleton>
  );
}

export default SkeletonWrapper;
