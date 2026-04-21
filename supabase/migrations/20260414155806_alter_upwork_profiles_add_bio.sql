drop policy "Enable read access for all users" on "public"."upwork_profiles";

alter table "public"."upwork_profiles" add column "bio" text;

alter table "public"."upwork_profiles" alter column "title" set not null;


  create policy "Enable read access for all users"
  on "public"."upwork_profiles"
  as permissive
  for select
  to public
using ((is_deleted = false));



