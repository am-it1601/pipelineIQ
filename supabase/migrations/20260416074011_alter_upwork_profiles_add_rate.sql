alter table "public"."upwork_profiles" add column "rate_per_hour" numeric default 0.00;

alter table "public"."upwork_profiles" add constraint "upwork_profiles_rate_per_hour_check" CHECK ((rate_per_hour >= (0)::numeric)) not valid;

alter table "public"."upwork_profiles" validate constraint "upwork_profiles_rate_per_hour_check";


