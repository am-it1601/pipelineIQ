import { cva } from "class-variance-authority";
import { CircleCheckBigIcon, Inbox, Loader, LucideProps, OctagonAlert } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

type IconComponent = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;

const stateVariants = cva("bg-sidebar-accent h-full", {
    variants: {
        variant: {
            success: "",
            pending: "",
            error: "",
            empty: "",
        },
    },
    defaultVariants: {
        variant: "pending",
    },
});

const stateTitleVariants = cva("", {
    variants: {
        variant: {
            success: "text-2xl text-green-600",
            pending: "",
            error: "text-2xl",
            empty: "text-2xl text-muted-foreground",
        },
    },
    defaultVariants: {
        variant: "pending",
    },
});

const stateMediaVariants = cva("", {
    variants: {
        variant: {
            success: "",
            pending: "",
            error: "animate-[wiggle_500ms_ease-in-out_infinite]",
            empty: "",
        },
    },
    defaultVariants: {
        variant: "pending",
    },
});

const stateIconVariants = cva("", {
    variants: {
        variant: {
            success: "size-10 text-primary animate-bounce",
            pending: "size-10 text-primary animate-[spin_2.5s_linear_infinite]",
            error: "h-12 w-12 text-destructive",
            empty: "size-10 text-muted-foreground",
        },
    },
    defaultVariants: {
        variant: "pending",
    },
});

const defaultTitleByVariant: Record<StateVariant, string> = {
    success: "Success",
    pending: "Please wait...",
    error: "Oops! This Was Not Part of the Plan",
    empty: "No Data Found",
};

const defaultDescriptionByVariant: Record<StateVariant, string> = {
    success: "Operation completed successfully.",
    pending: "Processing your request.",
    error: "Something Went Wrong. Please contact Administrator for support.",
    empty: "No records are available for this view yet.",
};

const defaultIconByVariant: Record<StateVariant, IconComponent> = {
    success: CircleCheckBigIcon,
    pending: Loader,
    error: OctagonAlert,
    empty: Inbox,
};

type StateVariant = "success" | "pending" | "error" | "empty";

type StateProps = React.ComponentProps<typeof Empty> & {
    variant?: StateVariant;
    title?: string;
    description?: string;
    icon?: IconComponent;
    children?: React.ReactNode;
    mediaVariant?: React.ComponentProps<typeof EmptyMedia>["variant"];
    mediaClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
};

const State = ({
    variant = "pending",
    title,
    description,
    icon,
    className,
    children,
    mediaVariant,
    mediaClassName,
    titleClassName,
    descriptionClassName,
    ...props
}: StateProps) => {
    const Icon = icon ?? defaultIconByVariant[variant];

    return (
        <Empty className={cn(stateVariants({ variant }), className)} {...props}>
            <EmptyHeader>
                <EmptyMedia
                    variant={
                        mediaVariant ?? (variant === "pending" ? "default" : variant === "empty" ? "icon" : undefined)
                    }
                    className={cn(stateMediaVariants({ variant }), mediaClassName)}
                >
                    {React.createElement(Icon, { className: stateIconVariants({ variant }) })}
                </EmptyMedia>
                <EmptyTitle className={cn(stateTitleVariants({ variant }), titleClassName)}>
                    {title ?? defaultTitleByVariant[variant]}
                </EmptyTitle>
                <EmptyDescription className={cn("max-w-xs text-pretty", descriptionClassName)}>
                    {description ?? defaultDescriptionByVariant[variant]}
                </EmptyDescription>
                {children ? <EmptyContent>{children}</EmptyContent> : null}
            </EmptyHeader>
        </Empty>
    );
};

export type { StateProps, StateVariant };
export default State;
