CREATE TABLE IF NOT EXISTS "Rounds" (
  id integer GENERATED ALWAYS AS IDENTITY (MINVALUE 0) CONSTRAINT "Rounds_pk" PRIMARY KEY,
  game_uniqid text NOT NULL CONSTRAINT "Rounds_games_uniqid_fk" REFERENCES "Games" (uniqid) ON DELETE CASCADE,
  round_number integer NOT NULL,
  target_uuid uuid NOT NULL CONSTRAINT "Rounds_target_uuid_fk" REFERENCES "Views" (uuid) ON DELETE CASCADE,
  guess_coordinates_x double precision DEFAULT NULL,
  guess_coordinates_y double precision DEFAULT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
  ended_at timestamp DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS "Rounds_game_uniqid" ON "Rounds" (game_uniqid);

CREATE INDEX IF NOT EXISTS "Rounds_round_number" ON "Rounds" (round_number);

CREATE INDEX IF NOT EXISTS "Rounds_target_uuid" ON "Rounds" (target_uuid);

CREATE
OR REPLACE FUNCTION delete_old_games_and_rounds() RETURNS void AS $ $ BEGIN
DELETE FROM
  "Games"
WHERE
  "ended_at" IS NULL
  AND "created_at" < NOW() - INTERVAL '8 hours';

DELETE FROM
  "Rounds"
WHERE
  "ended_at" IS NULL
  AND "created_at" < NOW() - INTERVAL '8 hours';

END;

$ $ LANGUAGE plpgsql;