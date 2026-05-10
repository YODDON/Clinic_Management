ALTER TABLE users
    MODIFY COLUMN role ENUM('admin','dentist') NOT NULL;
