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
      <div className="flex-between-col flex-1 gap-10">
        <h3>{title}</h3>
        {subtitle && <h5>{subtitle}</h5>}
        {showDivider && <Separator className="h-px" />}
      </div>
      <div>{action}</div>
    </div>
  );
};

export default PageHeader;
