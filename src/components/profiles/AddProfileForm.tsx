"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDollarSign, Link as LinkIcon, NotepadText, PenLineIcon, Tags, UserCircle } from "lucide-react";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";

import { cn } from "@/lib/utils";

import { UpworkProfileFormInput, upworkProfileSchema } from "@/forms/profile.schema";
import { BadgeInput } from "../custom/BadgeInput";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

type SubmitAction = "new" | "exit";

type AddProfileFormProps = {
    onSubmit: (formValues: UpworkProfileFormInput, action: SubmitAction) => Promise<boolean> | boolean;
    onCancel?: () => void;
    isSubmitting: boolean;
};

const defaultValues: UpworkProfileFormInput = {
    name: "",
    url: "",
    bio: "",
    title: "",
    skill_tags: [],
    rate_per_hour: "",
};

const labelClassName = "text-xs tracking-wide";

export const AddProfileForm = ({ onSubmit, onCancel, isSubmitting }: AddProfileFormProps) => {
    const submitActionRef = useRef<SubmitAction>("exit");

    const form = useForm<UpworkProfileFormInput>({
        resolver: zodResolver(upworkProfileSchema),
        mode: "onBlur",
        defaultValues,
    });

    const {
        register,
        control,
        reset,
        handleSubmit,
        formState: { errors },
    } = form;

    const submitHandler = async (values: UpworkProfileFormInput) => {
        const action = submitActionRef.current;
        const success = await onSubmit(values, action);

        if (!success) return;

        if (action === "new") {
            reset(defaultValues);
            return;
        }
    };

    return (
        <form
            id="form__upwork_profile"
            noValidate
            className="flex h-full w-full flex-col gap-4"
            onSubmit={handleSubmit(submitHandler)}
        >
            <FieldSet className="overflow-y-auto px-4 py-2">
                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field data-invalid={!!errors.name}>
                        <FieldLabel
                            htmlFor="upwork_profile-name"
                            aria-invalid={!!errors.name}
                            className={cn(!errors.name && "text-muted-foreground", labelClassName)}
                        >
                            <UserCircle className="size-4" />
                            Profile Name
                        </FieldLabel>
                        <Input id="upwork_profile-name" aria-invalid={!!errors.name} {...register("name")} />
                        {errors.name ? (
                            <FieldError className="field_error">{errors.name.message}</FieldError>
                        ) : (
                            <FieldDescription className="field_description">
                                Enter the full name of the professional or resource.
                            </FieldDescription>
                        )}
                    </Field>

                    <Field data-invalid={!!errors.title}>
                        <FieldLabel
                            htmlFor="upwork_profile-title"
                            aria-invalid={!!errors.title}
                            className={cn(!errors.title && "text-muted-foreground", labelClassName)}
                        >
                            <PenLineIcon className="size-4" />
                            Title
                        </FieldLabel>
                        <Input id="upwork_profile-title" aria-invalid={!!errors.title} {...register("title")} />
                        {errors.title ? (
                            <FieldError className="field_error">{errors.title.message}</FieldError>
                        ) : (
                            <FieldDescription className="field_description">
                                Enter the professional headline shown on the Upwork profile.
                            </FieldDescription>
                        )}
                    </Field>
                </FieldGroup>

                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field className="w-full gap-2" data-invalid={!!errors.url}>
                        <FieldLabel
                            htmlFor="upwork_profile-url"
                            aria-invalid={!!errors.url}
                            className={cn(!errors.url && "text-muted-foreground", labelClassName)}
                        >
                            <LinkIcon className="size-4" />
                            Upwork Profile Link
                        </FieldLabel>
                        <Input id="upwork_profile-url" type="url" aria-invalid={!!errors.url} {...register("url")} />
                        {errors.url ? (
                            <FieldError className="field_error">{errors.url.message}</FieldError>
                        ) : (
                            <FieldDescription className="field_description">
                                Provide the direct Upwork profile URL of the resource.
                            </FieldDescription>
                        )}
                    </Field>

                    <Field className="w-full gap-2" data-invalid={!!errors.rate_per_hour} data-required>
                        <FieldLabel
                            htmlFor="upwork_profile-rate_per_hour"
                            aria-invalid={!!errors.rate_per_hour}
                            className={cn(!errors.rate_per_hour && "text-muted-foreground", labelClassName)}
                        >
                            <CircleDollarSign className="size-4" />
                            Rate per Hour
                        </FieldLabel>
                        <Input
                            id="upwork_profile-rate_per_hour"
                            aria-invalid={!!errors.rate_per_hour}
                            {...register("rate_per_hour")}
                        />
                        {errors.rate_per_hour ? (
                            <FieldError className="field_error">{errors.rate_per_hour.message}</FieldError>
                        ) : (
                            <FieldDescription className="field_description">
                                Enter the hourly rate of the freelancer as mentioned on their Upwork profile.
                            </FieldDescription>
                        )}
                    </Field>
                </FieldGroup>

                <FieldGroup>
                    <Field className="w-full" data-invalid={!!errors.bio}>
                        <FieldLabel
                            htmlFor="upwork_profile-bio"
                            aria-invalid={!!errors.bio}
                            className={cn(!errors.bio && "text-muted-foreground", labelClassName)}
                        >
                            <NotepadText className="size-4" />
                            Bio
                        </FieldLabel>
                        <Textarea
                            id="upwork_profile-bio"
                            aria-invalid={!!errors.bio}
                            aria-required
                            {...register("bio")}
                        />
                        {errors.bio ? (
                            <FieldError className="field_error">{errors.bio.message}</FieldError>
                        ) : (
                            <FieldDescription className="field_description">
                                Write a concise professional summary covering the individual’s experience, strengths,
                                and domain relevance.
                            </FieldDescription>
                        )}
                    </Field>
                </FieldGroup>

                <FieldGroup>
                    <Controller
                        control={control}
                        name="skill_tags"
                        render={({ field, fieldState }) => (
                            <Field className="w-full" data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    htmlFor="upwork_profile-skill_tags"
                                    aria-invalid={fieldState.invalid}
                                    className={cn(!fieldState.invalid && "text-muted-foreground", labelClassName)}
                                >
                                    <Tags className="size-4" />
                                    Skill Tags
                                </FieldLabel>
                                <BadgeInput
                                    id="upwork_profile-skill_tags"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Enter skills separated by commas (max 15)"
                                    maxBadges={15}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.error ? (
                                    <FieldError className="field_error">{fieldState.error.message}</FieldError>
                                ) : (
                                    <FieldDescription className="field_description">
                                        Enter up to 15 skills or tags associated with the freelancer, as per the Upwork
                                        profile.
                                    </FieldDescription>
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </FieldSet>

            <Separator className="h-px" />

            <div className="flex gap-2 place-self-end-safe">
                {onCancel && (
                    <Button variant="destructive" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="secondary"
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                        submitActionRef.current = "new";
                    }}
                >
                    Save & New
                </Button>

                <Button
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => {
                        submitActionRef.current = "exit";
                    }}
                >
                    Save & Exit
                </Button>
            </div>
        </form>
    );
};
