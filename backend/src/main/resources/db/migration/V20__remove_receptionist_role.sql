DELETE FROM users
WHERE role NOT IN ('admin', 'dentist', 'customer');

ALTER TABLE users
    MODIFY COLUMN role ENUM('admin','dentist','customer') NOT NULL;
