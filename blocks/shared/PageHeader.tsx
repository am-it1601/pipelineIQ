import { Separator } from "@/components/ui/separator";
import React from "react";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  showDivider?: boolean;
};
const PageHeader = ({ title, subtitle, action, showDivider = true }: PageHeaderProps) => {
  return (
    <div className="flex-justify-between items-center gap-4">
      <div className="flex-justify-between flex-col flex-1">
        <h4 className="font-semibold">{title}</h4>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        {showDivider && <Separator className="h-px mt-2" />}
      </div>
      <div>{action}</div>
    </div>
  );
};

export default PageHeader;
