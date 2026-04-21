"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import * as React from "react";
import { useCallback, useState } from "react";

interface BadgeInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
    value?: string | string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    maxBadges?: number;
}

export const BadgeInput = ({
    value = [],
    onChange,
    placeholder = "Enter skills separated by commas",
    maxBadges = 15,
    ...inputProps
}: BadgeInputProps) => {
    const [inputValue, setInputValue] = useState("");

    // Ensure value is always an array
    const badges = Array.isArray(value)
        ? value
        : (value as string)
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0);

    const isFull = badges.length >= maxBadges;

    const handleRemoveBadge = useCallback(
        (indexToRemove: number) => {
            const newBadges = badges.filter((_, i) => i !== indexToRemove);
            onChange(newBadges);
        },
        [badges, onChange]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // Check if comma was added
        if (val.includes(",")) {
            const skill = val.split(",")[0].trim();

            if (skill && !isFull) {
                // Add skill to badges array
                const newBadges = [...badges, skill];
                onChange(newBadges);
                setInputValue(""); // Clear input
            } else {
                setInputValue(""); // Just clear input if skill is empty or max reached
            }
        } else {
            setInputValue(val);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={isFull}
                className={cn(
                    isFull ? "opacity-50 cursor-not-allowed" : "",
                    "placeholder:text-xs placeholder:text-muted-foreground/50 placeholder:leading-none"
                )}
                {...inputProps}
            />
            {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {badges.map((badge, index) => (
                        <Badge key={`${badge}-${index}`} variant="secondary" className="pl-2.5">
                            {badge}
                            <button
                                type="button"
                                onClick={() => handleRemoveBadge(index)}
                                className="ml-1.5 hover:opacity-70 transition-opacity"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            {badges.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    {badges.length} / {maxBadges} skills
                </p>
            )}
        </div>
    );
};
