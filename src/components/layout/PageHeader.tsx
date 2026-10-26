import { Fragment } from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemData[];
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbItem
                    className={cn(
                      "min-w-0",
                      isLast && "max-w-[60%] shrink-0",
                      !isLast &&
                        (index === 0 || item.label.length <= 12) &&
                        "shrink-0"
                    )}
                  >
                    {isLast ? (
                      <BreadcrumbPage className="truncate">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="block truncate">
                        <Link href={item.href ?? "/"}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="shrink-0" />
                  )}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
