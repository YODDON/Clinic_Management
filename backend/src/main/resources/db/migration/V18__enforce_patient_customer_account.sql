ALTER TABLE patients
    DROP FOREIGN KEY fk_patients_user;

ALTER TABLE patients
    MODIFY COLUMN user_id VARCHAR(36) NOT NULL;

ALTER TABLE patients
    ADD CONSTRAINT uq_patients_user UNIQUE (user_id);

ALTER TABLE patients
    ADD CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(id);
