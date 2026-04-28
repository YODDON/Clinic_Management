SET @has_employee_code = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dentists' AND COLUMN_NAME = 'employee_code'
);
SET @sql = IF(
    @has_employee_code = 0,
    'ALTER TABLE dentists ADD COLUMN employee_code VARCHAR(64) NULL AFTER id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_dob = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dentists' AND COLUMN_NAME = 'dob'
);
SET @sql = IF(
    @has_dob = 0,
    'ALTER TABLE dentists ADD COLUMN dob DATE NULL AFTER employee_code',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_workplace = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dentists' AND COLUMN_NAME = 'workplace'
);
SET @sql = IF(
    @has_workplace = 0,
    'ALTER TABLE dentists ADD COLUMN workplace VARCHAR(500) NULL AFTER dob',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_degree = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dentists' AND COLUMN_NAME = 'degree'
);
SET @sql = IF(
    @has_degree = 0,
    'ALTER TABLE dentists ADD COLUMN degree VARCHAR(255) NULL AFTER workplace',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE dentists
SET employee_code = CONCAT('DEN-', UPPER(RIGHT(REPLACE(id, '-', ''), 8)))
WHERE employee_code IS NULL OR employee_code = '' OR employee_code = 'DEN-USERDENT';

ALTER TABLE dentists
    MODIFY COLUMN employee_code VARCHAR(64) NOT NULL;

SET @has_employee_code_index = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dentists' AND INDEX_NAME = 'uk_dentists_employee_code'
);
SET @sql = IF(
    @has_employee_code_index = 0,
    'ALTER TABLE dentists ADD CONSTRAINT uk_dentists_employee_code UNIQUE (employee_code)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS service_price_history (
    id VARCHAR(36) PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    changed_by VARCHAR(255),
    change_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_price_history_service FOREIGN KEY (service_id) REFERENCES dental_services(id) ON DELETE CASCADE
);

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT UUID(), s.id, s.price, s.price, 'system', 'Initial service price'
FROM dental_services s
WHERE NOT EXISTS (
    SELECT 1
    FROM service_price_history h
    WHERE h.service_id = s.id
);
