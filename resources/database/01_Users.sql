create table if not exists "Users"
(
    id            integer generated always as identity (minvalue 0)
        constraint "Users_pk"
            primary key,
    username      text    not null,
    discriminator integer not null,
    email         text    not null unique,
    password      text    not null,
    avatar    integer    default null,
    flags         integer default 0,
    created_at    timestamp default current_timestamp
);

create index if not exists "Users_username"
    on "Users" (username);

create index if not exists "Users_email"
    on "Users" (email);