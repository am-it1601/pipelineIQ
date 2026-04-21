import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiCall } from "./api_client";

const handleError = (error: unknown) => {
    console.error(error);
    throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export { apiCall, cn, formatCurrency, handleError };
