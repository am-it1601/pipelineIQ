


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_groups"("target_user_id" "uuid") RETURNS "text"[]
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT COALESCE(array_agg(DISTINCT ug.slug), '{}')
  FROM public.user_group_memberships ugm
  JOIN public.user_groups ug ON ug.id = ugm.group_id
  WHERE ugm.user_id = target_user_id;
$$;


ALTER FUNCTION "public"."get_user_groups"("target_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_groups"("target_user_id" "uuid") IS 'Returns all group slugs for a user';



CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("target_user_id" "uuid") RETURNS "text"[]
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT COALESCE(array_agg(DISTINCT p.code), '{}')
  FROM public.user_group_memberships ugm
  JOIN public.group_permissions gp ON gp.group_id = ugm.group_id
  JOIN public.permissions p ON p.id = gp.permission_id
  WHERE ugm.user_id = target_user_id;
$$;


ALTER FUNCTION "public"."get_user_permissions"("target_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_permissions"("target_user_id" "uuid") IS 'Returns all permission codes for a user based on their group memberships';



CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_expiry_days INTEGER;
  v_invited_by UUID;
BEGIN
  -- Read configurable expiry from app_settings (default 7 days)
  SELECT COALESCE(
    (SELECT value::integer FROM public.app_settings WHERE key = 'invitation_expiry_days'),
    7
  ) INTO v_expiry_days;

  -- Safely cast invited_by — NULL if missing or empty
  BEGIN
    v_invited_by := NULLIF(TRIM(NEW.raw_user_meta_data->>'invited_by'), '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_invited_by := NULL;
  END;

  INSERT INTO public.users (
    id, email, full_name, avatar_initials, status,
    invited_by, invited_at, invitation_expires_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 2)),
    'invited',
    v_invited_by,
    now(),
    now() + (v_expiry_days || ' days')::interval
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("target_user_id" "uuid", "permission_code" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_group_memberships ugm
    JOIN public.group_permissions gp ON gp.group_id = ugm.group_id
    JOIN public.permissions p ON p.id = gp.permission_id
    WHERE ugm.user_id = target_user_id
      AND p.code = permission_code
  );
$$;


ALTER FUNCTION "public"."has_permission"("target_user_id" "uuid", "permission_code" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_permission"("target_user_id" "uuid", "permission_code" "text") IS 'Checks if a user has a specific permission code';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_users_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_users_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bd_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "monthly_target" integer DEFAULT 50,
    "incentive_eligible" boolean DEFAULT true,
    "join_date" "date" DEFAULT CURRENT_DATE,
    "avatar_initials" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "is_deleted" boolean DEFAULT false
);


ALTER TABLE "public"."bd_members" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bd_members"."is_deleted" IS 'Soft Delete Flag';



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_permissions" (
    "group_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL
);


ALTER TABLE "public"."group_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."group_permissions" IS 'Maps permissions to user groups';



CREATE TABLE IF NOT EXISTS "public"."lead_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "project_title" "text" NOT NULL,
    "lead_source" "text" NOT NULL,
    "upwork_link" "text",
    "profile_used_id" "uuid",
    "assigned_to_id" "uuid",
    "engagement_type" "text" NOT NULL,
    "proposal_value" numeric NOT NULL,
    "hourly_rate" numeric,
    "estimated_hours" numeric,
    "connects_used" integer DEFAULT 0 NOT NULL,
    "bid_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "remarks" "text",
    "is_hot" boolean DEFAULT false,
    "created_by_user_id" "uuid",
    "updated_by_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "from_user_id" "uuid",
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."permissions" IS 'Granular permission definitions for RBAC';



CREATE TABLE IF NOT EXISTS "public"."upwork_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "title" "text",
    "skill_tags" "text"[],
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_deleted" boolean DEFAULT false,
    CONSTRAINT "upwork_profiles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."upwork_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_group_memberships" (
    "user_id" "uuid" NOT NULL,
    "group_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assigned_by" "uuid"
);


ALTER TABLE "public"."user_group_memberships" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_group_memberships" IS 'Assigns users to one or more groups';



CREATE TABLE IF NOT EXISTS "public"."user_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "is_system" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_groups" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_groups" IS 'Defines available user groups/roles for RBAC';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" DEFAULT ''::"text" NOT NULL,
    "avatar_initials" "text" DEFAULT ''::"text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "invited_by" "uuid",
    "invited_at" timestamp with time zone,
    "invitation_expires_at" timestamp with time zone,
    "invitation_accepted_at" timestamp with time zone,
    "invitation_resent_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "users_status_check" CHECK (("status" = ANY (ARRAY['invited'::"text", 'active'::"text", 'inactive'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Auth module user records — stores identity and auth-relevant data';



ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."bd_members"
    ADD CONSTRAINT "bd_members_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."bd_members"
    ADD CONSTRAINT "bd_members_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."bd_members"
    ADD CONSTRAINT "bd_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_permissions"
    ADD CONSTRAINT "group_permissions_pkey" PRIMARY KEY ("group_id", "permission_id");



ALTER TABLE ONLY "public"."lead_logs"
    ADD CONSTRAINT "lead_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."upwork_profiles"
    ADD CONSTRAINT "upwork_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."upwork_profiles"
    ADD CONSTRAINT "upwork_profiles_profile_link_key" UNIQUE ("url");



ALTER TABLE ONLY "public"."user_group_memberships"
    ADD CONSTRAINT "user_group_memberships_pkey" PRIMARY KEY ("user_id", "group_id");



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "bd_members_user_id_idx" ON "public"."bd_members" USING "btree" ("user_id");



CREATE INDEX "idx_permissions_category" ON "public"."permissions" USING "btree" ("category");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "app_settings_updated_at" BEFORE UPDATE ON "public"."app_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "bd_members_updated_at" BEFORE UPDATE ON "public"."bd_members" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_users_updated_at"();



ALTER TABLE ONLY "public"."bd_members"
    ADD CONSTRAINT "bd_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."lead_logs"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."group_permissions"
    ADD CONSTRAINT "group_permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_permissions"
    ADD CONSTRAINT "group_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_logs"
    ADD CONSTRAINT "lead_logs_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_logs"
    ADD CONSTRAINT "lead_logs_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lead_logs"
    ADD CONSTRAINT "lead_logs_profile_used_id_fkey" FOREIGN KEY ("profile_used_id") REFERENCES "public"."upwork_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lead_logs"
    ADD CONSTRAINT "lead_logs_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."lead_logs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_group_memberships"
    ADD CONSTRAINT "user_group_memberships_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_group_memberships"
    ADD CONSTRAINT "user_group_memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_group_memberships"
    ADD CONSTRAINT "user_group_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Authenticated users can insert comments" ON "public"."comments" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Authenticated users can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can read app settings" ON "public"."app_settings" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can read bd_members" ON "public"."bd_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read comments" ON "public"."comments" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."upwork_profiles" FOR SELECT USING (true);



CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bd_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "group_permissions_authenticated_read" ON "public"."group_permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "groups_authenticated_read" ON "public"."user_groups" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."lead_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "memberships_admin_delete" ON "public"."user_group_memberships" FOR DELETE USING ("public"."has_permission"("auth"."uid"(), 'users:manage_groups'::"text"));



CREATE POLICY "memberships_admin_insert" ON "public"."user_group_memberships" FOR INSERT WITH CHECK ("public"."has_permission"("auth"."uid"(), 'users:manage_groups'::"text"));



CREATE POLICY "memberships_admin_read" ON "public"."user_group_memberships" FOR SELECT USING ("public"."has_permission"("auth"."uid"(), 'users:list'::"text"));



CREATE POLICY "memberships_admin_update" ON "public"."user_group_memberships" FOR UPDATE USING ("public"."has_permission"("auth"."uid"(), 'users:manage_groups'::"text"));



CREATE POLICY "memberships_self_read" ON "public"."user_group_memberships" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissions_authenticated_read" ON "public"."permissions" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."upwork_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_group_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_admin_delete" ON "public"."users" FOR DELETE USING ("public"."has_permission"("auth"."uid"(), 'users:delete'::"text"));



CREATE POLICY "users_admin_read" ON "public"."users" FOR SELECT USING ("public"."has_permission"("auth"."uid"(), 'users:list'::"text"));



CREATE POLICY "users_admin_update" ON "public"."users" FOR UPDATE USING ("public"."has_permission"("auth"."uid"(), 'users:update'::"text"));



CREATE POLICY "users_self_read" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_groups"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_groups"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_groups"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("target_user_id" "uuid", "permission_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("target_user_id" "uuid", "permission_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("target_user_id" "uuid", "permission_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_users_updated_at"() TO "service_role";
























GRANT ALL ON TABLE "public"."app_settings" TO "anon";
GRANT ALL ON TABLE "public"."app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."app_settings" TO "service_role";



GRANT ALL ON TABLE "public"."bd_members" TO "anon";
GRANT ALL ON TABLE "public"."bd_members" TO "authenticated";
GRANT ALL ON TABLE "public"."bd_members" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."group_permissions" TO "anon";
GRANT ALL ON TABLE "public"."group_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."group_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."lead_logs" TO "anon";
GRANT ALL ON TABLE "public"."lead_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_logs" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."upwork_profiles" TO "anon";
GRANT ALL ON TABLE "public"."upwork_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."upwork_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_group_memberships" TO "anon";
GRANT ALL ON TABLE "public"."user_group_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."user_group_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."user_groups" TO "anon";
GRANT ALL ON TABLE "public"."user_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."user_groups" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created_sync_public_users AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


