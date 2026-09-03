


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, email, name, role, status)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', -- Lấy name từ metadata chúng ta vừa gửi
    'user', 
    'pending'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_featured_approved_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(coalesce(email, '')) = lower(
        coalesce(current_setting('app.settings.admin_email', true), 'admin@vutruong.vn')
      )
      and lower(coalesce(role, '')) = 'admin'
      and lower(coalesce(status, '')) = 'approved'
  );
$$;


ALTER FUNCTION "public"."is_featured_approved_admin"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."set_featured_story_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_featured_story_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."featured_stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "featured_stories_sort_order_check" CHECK (("sort_order" >= 0))
);


ALTER TABLE "public"."featured_stories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."featured_story_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "public_id" "text" NOT NULL,
    "secure_url" "text" NOT NULL,
    "width" integer,
    "height" integer,
    "format" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "featured_story_images_height_check" CHECK ((("height" IS NULL) OR ("height" > 0))),
    CONSTRAINT "featured_story_images_public_id_check" CHECK (("public_id" ~~ 'vutruong_vn/featureds/%'::"text")),
    CONSTRAINT "featured_story_images_secure_url_check" CHECK (("secure_url" ~ '^https://res[.]cloudinary[.]com/'::"text")),
    CONSTRAINT "featured_story_images_sort_order_check" CHECK (("sort_order" >= 0)),
    CONSTRAINT "featured_story_images_width_check" CHECK ((("width" IS NULL) OR ("width" > 0)))
);


ALTER TABLE "public"."featured_story_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "text" DEFAULT ''::"text" NOT NULL,
    "content" "text",
    "images" "text"[],
    "hashtags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "is_pinned" boolean DEFAULT false,
    "user_id" "uuid",
    "public_ids" "text",
    "visibility" "text" DEFAULT 'public'::"text",
    "excerpt" "text",
    "cover_image" "text"
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "avatar" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "bio" "text",
    "cover_image" "text",
    "role" "text" DEFAULT 'user'::"text",
    "status" "text" DEFAULT '''pending'''::"text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."status" IS 'Trạng thái của user (hoạt động ở route watch)';



CREATE TABLE IF NOT EXISTS "public"."secrets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "account" "text",
    "password" "text",
    "email" "text",
    "recovery_email" "text",
    "phone" "text",
    "recovery_phone" "text",
    "secret_code" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."secrets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_avatars" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "url" "text" NOT NULL,
    "public_id" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_avatars" OWNER TO "postgres";


ALTER TABLE ONLY "public"."featured_stories"
    ADD CONSTRAINT "featured_stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."featured_story_images"
    ADD CONSTRAINT "featured_story_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."featured_story_images"
    ADD CONSTRAINT "featured_story_images_public_id_key" UNIQUE ("public_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."secrets"
    ADD CONSTRAINT "secrets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_avatars"
    ADD CONSTRAINT "user_avatars_pkey" PRIMARY KEY ("id");



CREATE INDEX "featured_stories_sort_order_idx" ON "public"."featured_stories" USING "btree" ("sort_order", "created_at");



CREATE INDEX "featured_story_images_story_order_idx" ON "public"."featured_story_images" USING "btree" ("story_id", "sort_order", "created_at");



CREATE INDEX "idx_posts_created_at" ON "public"."posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_posts_hashtags_gin" ON "public"."posts" USING "gin" ("hashtags");



CREATE INDEX "idx_posts_is_pinned" ON "public"."posts" USING "btree" ("is_pinned");



CREATE INDEX "idx_posts_user_id" ON "public"."posts" USING "btree" ("user_id");



CREATE INDEX "idx_posts_user_pinned_created" ON "public"."posts" USING "btree" ("user_id", "is_pinned" DESC, "created_at" DESC);



CREATE INDEX "idx_posts_visibility" ON "public"."posts" USING "btree" ("visibility");



CREATE INDEX "idx_user_avatars_user_id" ON "public"."user_avatars" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "set_featured_story_updated_at" BEFORE UPDATE ON "public"."featured_stories" FOR EACH ROW EXECUTE FUNCTION "public"."set_featured_story_updated_at"();



ALTER TABLE ONLY "public"."featured_stories"
    ADD CONSTRAINT "featured_stories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."featured_story_images"
    ADD CONSTRAINT "featured_story_images_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."featured_stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_avatars"
    ADD CONSTRAINT "user_avatars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow insert for authenticated" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Anyone can view profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Approved admin can delete featured stories" ON "public"."featured_stories" FOR DELETE TO "authenticated" USING ("public"."is_featured_approved_admin"());



CREATE POLICY "Approved admin can delete featured story images" ON "public"."featured_story_images" FOR DELETE TO "authenticated" USING ("public"."is_featured_approved_admin"());



CREATE POLICY "Approved admin can insert featured stories" ON "public"."featured_stories" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_featured_approved_admin"() AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Approved admin can insert featured story images" ON "public"."featured_story_images" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_featured_approved_admin"());



CREATE POLICY "Approved admin can update featured stories" ON "public"."featured_stories" FOR UPDATE TO "authenticated" USING ("public"."is_featured_approved_admin"()) WITH CHECK ("public"."is_featured_approved_admin"());



CREATE POLICY "Approved admin can update featured story images" ON "public"."featured_story_images" FOR UPDATE TO "authenticated" USING ("public"."is_featured_approved_admin"()) WITH CHECK ("public"."is_featured_approved_admin"());



CREATE POLICY "Cho phép Admin cập nhật profiles" ON "public"."profiles" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Featured stories are publicly readable" ON "public"."featured_stories" FOR SELECT USING (true);



CREATE POLICY "Featured story images are publicly readable" ON "public"."featured_story_images" FOR SELECT USING (true);



CREATE POLICY "Only admin can update bio" ON "public"."profiles" FOR UPDATE USING (("auth"."email"() = 'admin@vutruong.vn'::"text"));



CREATE POLICY "Owner can delete own avatars" ON "public"."user_avatars" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Owner can insert own avatars" ON "public"."user_avatars" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Owner can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Owner can update own avatars" ON "public"."user_avatars" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Owner can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Owner can view own avatars" ON "public"."user_avatars" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their avatars" ON "public"."user_avatars" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their avatars" ON "public"."user_avatars" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "delete_posts_policy" ON "public"."posts" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



CREATE POLICY "delete_secrets_policy" ON "public"."secrets" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



ALTER TABLE "public"."featured_stories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."featured_story_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_posts_policy" ON "public"."posts" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



CREATE POLICY "insert_secrets_policy" ON "public"."secrets" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."secrets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_posts_policy" ON "public"."posts" FOR SELECT TO "authenticated", "anon" USING ((("visibility" = 'public'::"text") OR ((( SELECT "auth"."uid"() AS "uid") = '785f79e8-223a-41ea-a52d-dead8e2bf383'::"uuid") AND ((( SELECT "auth"."jwt"() AS "jwt") ->> 'email'::"text") = 'admin@vutruong.vn'::"text"))));



CREATE POLICY "select_secrets_policy" ON "public"."secrets" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



CREATE POLICY "update_posts_policy" ON "public"."posts" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



CREATE POLICY "update_secrets_policy" ON "public"."secrets" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'admin@vutruong.vn'::"text"));



ALTER TABLE "public"."user_avatars" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_featured_approved_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_featured_approved_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_featured_approved_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_featured_approved_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_featured_story_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_featured_story_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_featured_story_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."featured_stories" TO "anon";
GRANT ALL ON TABLE "public"."featured_stories" TO "authenticated";
GRANT ALL ON TABLE "public"."featured_stories" TO "service_role";



GRANT ALL ON TABLE "public"."featured_story_images" TO "anon";
GRANT ALL ON TABLE "public"."featured_story_images" TO "authenticated";
GRANT ALL ON TABLE "public"."featured_story_images" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."secrets" TO "anon";
GRANT ALL ON TABLE "public"."secrets" TO "authenticated";
GRANT ALL ON TABLE "public"."secrets" TO "service_role";



GRANT ALL ON TABLE "public"."user_avatars" TO "anon";
GRANT ALL ON TABLE "public"."user_avatars" TO "authenticated";
GRANT ALL ON TABLE "public"."user_avatars" TO "service_role";



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







