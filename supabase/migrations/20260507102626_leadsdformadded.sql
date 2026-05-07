alter table "public"."comments" drop constraint "comments_user_id_fkey";

alter table "public"."lead_logs" drop constraint "lead_logs_assigned_to_id_fkey";

alter table "public"."lead_logs" drop constraint "lead_logs_created_by_user_id_fkey";

alter table "public"."lead_logs" drop constraint "lead_logs_updated_by_user_id_fkey";

alter table "public"."notifications" drop constraint "notifications_comment_id_fkey";

alter table "public"."notifications" drop constraint "notifications_from_user_id_fkey";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."lead_logs" add constraint "lead_logs_assigned_to_id_fkey" FOREIGN KEY (assigned_to_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."lead_logs" validate constraint "lead_logs_assigned_to_id_fkey";

alter table "public"."lead_logs" add constraint "lead_logs_created_by_user_id_fkey" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."lead_logs" validate constraint "lead_logs_created_by_user_id_fkey";

alter table "public"."lead_logs" add constraint "lead_logs_updated_by_user_id_fkey" FOREIGN KEY (updated_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."lead_logs" validate constraint "lead_logs_updated_by_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.lead_comments(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_comment_id_fkey";

alter table "public"."notifications" add constraint "notifications_from_user_id_fkey" FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."notifications" validate constraint "notifications_from_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";


