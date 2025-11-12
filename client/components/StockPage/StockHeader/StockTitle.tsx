"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DescriptionProps {
  text: string;
  maxLength?: number;
}

export function ExpandableDescription({ text, maxLength = 20 }: DescriptionProps) {
  const [expanded, setExpanded] = React.useState(false);

  // Nếu text ngắn hơn giới hạn thì không cần "Xem thêm"
  const isLong = text.length > maxLength;
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "...";

  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {displayText}
      {isLong && (
        <a
          href="#"
          className="text-primary hover:underline ml-1"
          onClick={(e) => {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </a>
      )}
    </p>
  );
}

interface StockTitleProps {
  ticker?: string;
  exchange?: string;
  companyName?: string;
  description?: string;
  logoUrl?: string;
  className?: string;
}

export function StockTitle({
  ticker = "FPT",
  exchange = "HOSE",
  companyName = "FPT Corp. – Công ty Cổ phần FPT",
  description,
  logoUrl,
  className,
}: StockTitleProps) {
  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="flex items-start gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${ticker} logo`}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-semibold text-muted-foreground">
              {ticker[0]}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {ticker} ({exchange})
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{companyName}</p>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
          <a href="#">Xem thêm</a>
        </p>
      )}
    </div>
  );
}

