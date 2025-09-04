

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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."freelancer_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task" "text" NOT NULL,
    "model" "text" NOT NULL,
    "language" "text" NOT NULL,
    "freelancer_name" "text" NOT NULL,
    "freelancer_type" "text" NOT NULL,
    "pay_rate_per_day" numeric(10,2) NOT NULL,
    "total_time_taken" numeric(5,2) NOT NULL,
    "start_date" "date" NOT NULL,
    "completion_date" "date" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "freelancer_tasks_freelancer_type_check" CHECK (("freelancer_type" = ANY (ARRAY['Linguist'::"text", 'Language Expert'::"text"])))
);


ALTER TABLE "public"."freelancer_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."freelancers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."freelancers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."freelancer_tasks"
    ADD CONSTRAINT "freelancer_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."freelancers"
    ADD CONSTRAINT "freelancers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."freelancers"
    ADD CONSTRAINT "freelancers_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_freelancer_tasks_dates" ON "public"."freelancer_tasks" USING "btree" ("start_date", "completion_date");



CREATE INDEX "idx_freelancer_tasks_freelancer_name" ON "public"."freelancer_tasks" USING "btree" ("freelancer_name");



CREATE INDEX "idx_freelancer_tasks_language" ON "public"."freelancer_tasks" USING "btree" ("language");



CREATE INDEX "idx_freelancer_tasks_model" ON "public"."freelancer_tasks" USING "btree" ("model");



CREATE INDEX "idx_freelancers_name" ON "public"."freelancers" USING "btree" ("name");



CREATE POLICY "Enable delete for all users" ON "public"."freelancer_tasks" FOR DELETE USING (true);



CREATE POLICY "Enable insert for all users" ON "public"."freelancer_tasks" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."freelancer_tasks" FOR SELECT USING (true);



CREATE POLICY "Enable update for all users" ON "public"."freelancer_tasks" FOR UPDATE USING (true) WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."freelancer_tasks" TO "anon";
GRANT ALL ON TABLE "public"."freelancer_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."freelancer_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."freelancers" TO "anon";
GRANT ALL ON TABLE "public"."freelancers" TO "authenticated";
GRANT ALL ON TABLE "public"."freelancers" TO "service_role";









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






























RESET ALL;
