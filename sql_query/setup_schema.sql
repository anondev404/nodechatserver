/*DROP DATABASE CHATSERVER;*/

CREATE DATABASE IF NOT EXISTS CHATSERVER;

USE CHATSERVER;

CREATE TABLE IF NOT EXISTS USERROLE(
role_id int,
role_type varchar(255),
constraint role_id_pk primary key(role_id),
constraint role_type_un unique key(role_type)
);

CREATE TABLE IF NOT EXISTS USERCRED(
user_id int auto_increment,
username varchar(50),
password varchar(256) not null,
role_id int default 100,
constraint user_id_pk primary key(user_id),
constraint username_un unique key(username),
constraint role_id_fk foreign key(role_id) references USERROLE(role_id)
);

CREATE TABLE IF NOT EXISTS MESSAGEREC(
message_rec_id int auto_increment,
sender_user_id int,
receiver_user_id int,
message varchar(4096) not null,
timelog timestamp default current_timestamp(),
is_delivered boolean default false,
is_read boolean default false,
constraint message_rec_id_pk primary key(message_rec_id),
constraint sender_user_id_fk foreign key(sender_user_id) references USERCRED(user_id) on delete cascade,
constraint receiver_user_id_fk foreign key(receiver_user_id) references USERCRED(user_id) on delete cascade
);

/*
CREATE TABLE IF NOT EXISTS MESSAGEDETAILS(
message_rec_id int,
message varchar(4096) not null,
timelog timestamp default current_timestamp(),
is_delivered boolean,
is_read boolean,
constraint message_rec_id_fk foreign key(message_rec_id) references MESSAGEREC(message_rec_id) on delete cascade
);
*/

INSERT INTO USERROLE values (100, 'NORMAL'), (101, 'ADMIN');

SHOW TABLES;


