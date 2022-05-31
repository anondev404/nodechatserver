USE CHATSERVER;

INSERT INTO USERROLE values (100, 'NORMAL'), (101, 'ADMIN');

SELECT * FROM USERROLE;

INSERT INTO USERCRED(username, password, role_id) values ('xyz', '123', 100), ('test', '123', 100);

SELECT * FROM USERCRED;

SELECT user_id FROM usercred AS u WHERE u.username = 'test';
INSERT INTO MESSAGEREC(sender_user_id, receiver_user_id, message) values(1, 2, 'hi');
INSERT INTO MESSAGEREC(sender_user_id, receiver_user_id, message) values(2, 1, 'hello');

select * from messagerec;


select user_id, username from usercred
where username like 'x%'