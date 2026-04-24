DELETE FROM users WHERE role = 'cashier';

ALTER TABLE users
    MODIFY COLUMN role ENUM('admin','dentist','receptionist') NOT NULL;
