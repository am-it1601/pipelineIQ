import { z } from "zod";

export const upworkUrlSchema = z
  .string()
  .trim()
  .url("Please enter a valid URL.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.hostname === "upwork.com" || url.hostname === "www.upwork.com";
    } catch {
      return false;
    }
  }, "Only upwork.com links are allowed.");

export const optionalNumberFromInput = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number("Please enter a valid number.").or(z.undefined()));
