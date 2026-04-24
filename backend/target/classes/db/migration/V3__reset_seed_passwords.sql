UPDATE users
SET password_hash = '{noop}Admin@123'
WHERE email = 'admin@dentalpro.local';

UPDATE users
SET password_hash = '{noop}Dentist@123'
WHERE email = 'dentist@dentalpro.local';

UPDATE users
SET password_hash = '{noop}Reception@123'
WHERE email = 'reception@dentalpro.local';

