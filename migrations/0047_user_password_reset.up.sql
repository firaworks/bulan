alter table users add column password_reset_token varchar(255);
alter table users add column password_reset_token_expiry datetime;