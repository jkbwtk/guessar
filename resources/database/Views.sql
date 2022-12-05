create table if not exists "Views"
(
    uuid           uuid                        not null
        primary key,
    position_x     double precision            not null,
    position_y     double precision            not null,
    position_z     double precision            not null,
    position_rad   double precision            not null,
    in_vehicle     integer                     not null,
    weather_region integer                     not null,
    weather_old    integer                     not null,
    weather_new    integer                     not null,
    wavyness       double precision            not null,
    time_hours     integer                     not null,
    time_minutes   integer                     not null,
    quaternion_x   double precision            not null,
    quaternion_y   double precision            not null,
    quaternion_z   double precision            not null,
    quaternion_w   double precision            not null,
    neighbors      uuid[] default '{}'::uuid[] not null
);

