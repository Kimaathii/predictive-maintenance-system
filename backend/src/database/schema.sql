-- PostgreSQL DDL Schema for AWS RDS Deployment
-- Nigerian Content Development & Monitoring Board (NCDMB) Compliant Enterprise Schema

CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    facility_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(36) PRIMARY KEY,
    facility_id VARCHAR(36) REFERENCES facilities(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) UNIQUE NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    criticality_rating VARCHAR(20) DEFAULT 'HIGH',
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    health_index REAL DEFAULT 100.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    facility_id VARCHAR(36) REFERENCES facilities(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry_logs (
    id VARCHAR(36) PRIMARY KEY,
    equipment_id VARCHAR(36) REFERENCES equipment(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vibration_rms_mms REAL NOT NULL,
    temperature_c REAL NOT NULL,
    pressure_psi REAL NOT NULL,
    flow_rate_bpd REAL NOT NULL,
    health_index REAL NOT NULL,
    anomaly_flag BOOLEAN DEFAULT FALSE,
    failure_prediction VARCHAR(100) DEFAULT 'NORMAL'
);

CREATE TABLE IF NOT EXISTS work_orders (
    id VARCHAR(36) PRIMARY KEY,
    equipment_id VARCHAR(36) REFERENCES equipment(id) ON DELETE CASCADE,
    assigned_to_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    predicted_failure_mode VARCHAR(100),
    estimated_rul_hours REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cost_avoidance_reports (
    id VARCHAR(36) PRIMARY KEY,
    work_order_id VARCHAR(36) REFERENCES work_orders(id) ON DELETE CASCADE,
    estimated_downtime_hours_avoided REAL NOT NULL,
    production_loss_rate_usd_per_hr REAL NOT NULL,
    estimated_repair_cost_usd REAL NOT NULL,
    net_savings_usd REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    metadata TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
