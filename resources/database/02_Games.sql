CREATE TABLE IF NOT EXISTS "Games" (
  uniqid text NOT NULL CONSTRAINT "Games_pk" PRIMARY KEY UNIQUE,
  user_id integer DEFAULT NULL CONSTRAINT "Games_users_id_fk" REFERENCES "Users" (id) ON DELETE CASCADE,
  settings integer NOT NULL,
  time_limit integer NOT NULL,
  rounds integer NOT NULL,
  final_score double precision DEFAULT NULL,
  final_time integer DEFAULT NULL,
  -- final_rounds json DEFAULT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  ended_at timestamp DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS "Games_user_id" ON "Games" (user_id);

CREATE INDEX IF NOT EXISTS "Games_final_score" ON "Games" (final_score);

CREATE INDEX IF NOT EXISTS "Games_final_time" ON "Games" (final_time);