CREATE TABLE IF NOT EXISTS dentist_duties (
    id VARCHAR(36) PRIMARY KEY,
    duty_date DATE NOT NULL,
    dentist_id VARCHAR(36) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dentist_duties_date UNIQUE (duty_date),
    CONSTRAINT fk_dentist_duties_dentist FOREIGN KEY (dentist_id) REFERENCES dentists(id)
);
