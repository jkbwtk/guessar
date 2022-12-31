create table if not exists "Avatars"
(
    id       integer generated always as identity (minvalue 0)
        constraint "Avatars_pk"
            primary key,
    user_id  integer not null unique
        constraint "Avatars_users_id_fk"
            references "Users" (id) on delete cascade,
    mime     text   not null,
    image    text   not null,
    created_at timestamp default current_timestamp
);

create index if not exists "Avatars_user_id"
    on "Avatars" (user_id);


alter table "Users" add 
constraint "Users_avatar_fk" foreign key ("avatar") 
references "Avatars" (id) on delete set null;


create or replace function "Users_avatar_fk_update"()
    returns trigger
    language plpgsql
as $$
begin
    update "Users" set "avatar" = new.id where id = new.user_id;
    return new;
end;
$$;


create trigger "Users_avatar_fk_update_trigger"
    after insert on "Avatars"
    for each row execute procedure "Users_avatar_fk_update"();