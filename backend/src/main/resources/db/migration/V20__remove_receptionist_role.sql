DELETE FROM users
WHERE role = 'receptionist';

ALTER TABLE users
    MODIFY COLUMN role ENUM('admin','dentist','customer') NOT NULL;
