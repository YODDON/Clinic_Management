ALTER TABLE users
    MODIFY COLUMN role ENUM('admin','dentist','receptionist','customer') NOT NULL;
