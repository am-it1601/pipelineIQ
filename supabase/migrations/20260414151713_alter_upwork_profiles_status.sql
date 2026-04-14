alter table "public"."upwork_profiles" drop constraint "upwork_profiles_status_check";

alter table "public"."upwork_profiles" drop column "status";

alter table "public"."upwork_profiles" add column "is_active" boolean default true;


