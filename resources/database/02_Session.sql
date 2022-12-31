create table if not exists "Sessions"
(
  id          integer generated always as identity (minvalue 0)
    constraint "Sessions_pk"
      primary key,
  user_id     integer not null constraint "Sessions_user_id_fk"
    references "Users" (id) on delete cascade,
  token       text    not null unique,
  created_at  timestamp default current_timestamp,
  refreshed_at timestamp default current_timestamp
);

create index if not exists "Sessions_user_id"
  on "Sessions" (user_id);

create index if not exists "Sessions_token"
  on "Sessions" (token);
