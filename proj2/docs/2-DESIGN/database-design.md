# Database Detailed Design

**Project:** Eatsential - Dual-Dimension Health Platform (Physical + Mental Wellness)  
**Document Type:** Database Design Specification  
**Version:** 2.0 (Mental Wellness Tables Added)  
**Date:** October 25, 2025  
**Database:** PostgreSQL 15+ (Production), SQLite 3 (Development)

**Version 2.0 Updates**:
- Added 7 Mental Wellness tables (Section 9)
- Added health tagging system for food categorization
- Added AI chat session tracking
- Enhanced data privacy controls for mental health data
- Updated sizing estimates to include Mental Wellness features

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Database Architecture](#2-database-architecture)
3. [Schema Design](#3-schema-design)
4. [Table Specifications](#4-table-specifications)
5. [Indexes and Performance](#5-indexes-and-performance)
6. [Constraints and Validation](#6-constraints-and-validation)
7. [Stored Procedures and Functions](#7-stored-procedures-and-functions)
8. [Data Migration Strategy](#8-data-migration-strategy)
9. [Backup and Recovery](#9-backup-and-recovery)
10. [Security](#10-security)

---

## 1. Introduction

### 1.1 Purpose

This document provides a comprehensive design specification for the Eatsential database, including schema design, performance optimization, and data management strategies.

### 1.2 Design Principles

1. **Normalization**: 3NF for transactional data, selective denormalization for performance
2. **Data Integrity**: Strong constraints and validation
3. **Performance**: Optimized indexes and query patterns
4. **Scalability**: Partitioning and archival strategies
5. **Security**: Encryption, access control, and audit trails

### 1.3 Database Specifications

| Aspect      | Development  | Production      |
| ----------- | ------------ | --------------- |
| DBMS        | SQLite 3.40+ | PostgreSQL 15+  |
| Storage     | Local file   | AWS RDS         |
| Backup      | Manual       | Automated daily |
| Encryption  | None         | AES-256 at rest |
| Connections | Single       | Pool (20-100)   |

---

## 2. Database Architecture

### 2.1 Logical Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        API[FastAPI Application]
        ORM[SQLAlchemy ORM]
    end

    subgraph "Database Layer"
        CP[Connection Pool]
        PG[(PostgreSQL)]

        subgraph "Schemas"
            Public[public schema]
            Auth[auth schema]
            Health[health schema]
            Audit[audit schema]
        end
    end

    API --> ORM
    ORM --> CP
    CP --> PG
    PG --> Public
    PG --> Auth
    PG --> Health
    PG --> Audit
```

### 2.2 Physical Architecture

```sql
-- Database configuration
CREATE DATABASE eatsential
    WITH
    OWNER = eatsential_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0
    CONNECTION LIMIT = 100;

-- Schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS health;
CREATE SCHEMA IF NOT EXISTS audit;
```

### 2.3 Connection Management

```python
# SQLAlchemy engine configuration
engine = create_engine(
    DATABASE_URL,
    pool_size=20,           # Number of connections to maintain
    max_overflow=40,        # Maximum overflow connections
    pool_timeout=30,        # Timeout before giving up
    pool_recycle=1800,      # Recycle connections after 30 minutes
    pool_pre_ping=True,     # Test connections before using
    echo=False,             # Don't log SQL statements
    future=True             # Use SQLAlchemy 2.0 style
)
```

---

## 3. Schema Design

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o| health_profiles : has
    users ||--o{ user_sessions : has
    users ||--o{ audit_logs : generates

    health_profiles ||--o{ user_allergies : contains
    health_profiles ||--o{ dietary_restrictions : has
    health_profiles ||--o{ medical_conditions : has
    health_profiles ||--o{ fitness_goals : has

    allergens ||--o{ user_allergies : references

    users ||--o{ recommendations : receives
    recommendations }o--|| restaurants : from
    recommendations }o--|| meals : suggests

    restaurants ||--o{ meals : offers
    meals ||--o{ meal_ingredients : contains
    ingredients ||--o{ meal_ingredients : used_in

    users ||--o{ user_preferences : has
    users ||--o{ feedback : provides
```

### 3.2 Schema Organization

| Schema | Purpose               | Tables                                                      |
| ------ | --------------------- | ----------------------------------------------------------- |
| public | Core application data | users, health_profiles, recommendations                     |
| auth   | Authentication data   | user_sessions, password_history, verification_tokens        |
| health | Health-specific data  | allergens, medical_conditions_ref, dietary_restrictions_ref |
| audit  | Audit and compliance  | audit_logs, data_changes, access_logs                       |

---

## 4. Table Specifications

### 4.1 Core Tables

#### users

Primary user account information.

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
    CONSTRAINT chk_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON public.users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### health_profiles

User health information.

```sql
CREATE TABLE public.health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    date_of_birth DATE,
    gender VARCHAR(20),
    activity_level VARCHAR(20),
    bmr_calories INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN gender = 'male' THEN
                (10 * weight_kg + 6.25 * height_cm - 5 * EXTRACT(YEAR FROM AGE(date_of_birth)) + 5)::INTEGER
            WHEN gender = 'female' THEN
                (10 * weight_kg + 6.25 * height_cm - 5 * EXTRACT(YEAR FROM AGE(date_of_birth)) - 161)::INTEGER
            ELSE NULL
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_height_range CHECK (height_cm BETWEEN 50 AND 300),
    CONSTRAINT chk_weight_range CHECK (weight_kg BETWEEN 20 AND 500),
    CONSTRAINT chk_age_minimum CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '13 years'),
    CONSTRAINT chk_gender_values CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    CONSTRAINT chk_activity_level CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'))
);

-- Indexes
CREATE INDEX idx_health_profiles_user_id ON public.health_profiles(user_id);
```

#### user_allergies

User allergy information with severity levels.

```sql
CREATE TABLE public.user_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    health_profile_id UUID NOT NULL REFERENCES public.health_profiles(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES health.allergens(id),
    severity VARCHAR(20) NOT NULL,
    notes TEXT,
    diagnosed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_severity_values CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING')),
    CONSTRAINT chk_notes_length CHECK (LENGTH(notes) <= 500),
    CONSTRAINT uq_user_allergen UNIQUE (user_id, allergen_id)
);

-- Indexes
CREATE INDEX idx_user_allergies_user_id ON public.user_allergies(user_id);
CREATE INDEX idx_user_allergies_severity ON public.user_allergies(severity) WHERE severity IN ('SEVERE', 'LIFE_THREATENING');
```

### 4.2 Reference Tables

#### allergens

Master list of recognized allergens.

```sql
CREATE TABLE health.allergens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    common_foods TEXT[],
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    fda_recognized BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_allergen_category CHECK (category IN ('Food', 'Environmental', 'Medication', 'Other'))
);

-- Insert approved allergens
INSERT INTO health.allergens (name, category, common_foods) VALUES
    ('Peanuts', 'Food', ARRAY['Peanut butter', 'Peanut oil', 'Mixed nuts']),
    ('Tree Nuts', 'Food', ARRAY['Almonds', 'Cashews', 'Walnuts', 'Pecans']),
    ('Milk', 'Food', ARRAY['Cheese', 'Yogurt', 'Butter', 'Ice cream']),
    ('Eggs', 'Food', ARRAY['Mayonnaise', 'Baked goods', 'Pasta']),
    ('Wheat', 'Food', ARRAY['Bread', 'Pasta', 'Cereals', 'Flour']),
    ('Soy', 'Food', ARRAY['Tofu', 'Soy sauce', 'Edamame', 'Tempeh']),
    ('Fish', 'Food', ARRAY['Salmon', 'Tuna', 'Cod', 'Fish sauce']),
    ('Shellfish', 'Food', ARRAY['Shrimp', 'Crab', 'Lobster', 'Oysters']),
    ('Sesame', 'Food', ARRAY['Tahini', 'Sesame oil', 'Hummus']),
    ('Mustard', 'Food', ARRAY['Mustard sauce', 'Mustard seeds', 'Mustard powder']),
    ('Celery', 'Food', ARRAY['Celery stalks', 'Celery salt', 'Soup stocks']),
    ('Lupin', 'Food', ARRAY['Lupin flour', 'Lupin beans']);
```

### 4.3 Authentication Tables

#### verification_tokens

Email verification tokens.

```sql
CREATE TABLE auth.verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    token_type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_token_type CHECK (token_type IN ('email_verify', 'password_reset', 'email_change')),
    CONSTRAINT chk_token_expiry CHECK (expires_at > created_at)
);

-- Indexes
CREATE INDEX idx_verification_tokens_token ON auth.verification_tokens(token) WHERE used_at IS NULL;
CREATE INDEX idx_verification_tokens_expires ON auth.verification_tokens(expires_at) WHERE used_at IS NULL;
```

### 4.4 Future Tables (Planned)

#### restaurants

Restaurant information.

```sql
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(50),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(2) DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    website VARCHAR(255),
    hours JSONB,
    rating DECIMAL(2,1),
    price_range INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_rating_range CHECK (rating BETWEEN 0 AND 5),
    CONSTRAINT chk_price_range CHECK (price_range BETWEEN 1 AND 4),
    CONSTRAINT chk_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND
        longitude BETWEEN -180 AND 180
    )
);

-- Spatial index for location queries
CREATE INDEX idx_restaurants_location ON public.restaurants USING GIST (
    ST_MakePoint(longitude, latitude)
);
```

#### meals

Restaurant meal items.

```sql
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    calories INTEGER,
    protein_g DECIMAL(5,1),
    carbs_g DECIMAL(5,1),
    fat_g DECIMAL(5,1),
    fiber_g DECIMAL(5,1),
    sodium_mg INTEGER,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_price_positive CHECK (price > 0),
    CONSTRAINT chk_calories_range CHECK (calories BETWEEN 0 AND 5000),
    CONSTRAINT chk_nutrients_positive CHECK (
        protein_g >= 0 AND carbs_g >= 0 AND fat_g >= 0 AND fiber_g >= 0
    )
);

-- Indexes
CREATE INDEX idx_meals_restaurant_id ON public.meals(restaurant_id);
CREATE INDEX idx_meals_calories ON public.meals(calories);
CREATE INDEX idx_meals_available ON public.meals(is_available);
```

---

## 5. Indexes and Performance

### 5.1 Index Strategy

| Index Type | Use Case                   | Example              |
| ---------- | -------------------------- | -------------------- |
| B-Tree     | Equality and range queries | user emails, dates   |
| Hash       | Exact match only           | UUIDs                |
| GIN        | Full-text search           | meal descriptions    |
| GIST       | Spatial queries            | restaurant locations |
| BRIN       | Large sequential data      | audit logs           |

### 5.2 Performance Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_user_allergies_lookup
    ON public.user_allergies(user_id, allergen_id)
    INCLUDE (severity);

CREATE INDEX idx_meals_search
    ON public.meals(restaurant_id, is_available, calories);

-- Partial indexes for filtered queries
CREATE INDEX idx_active_users
    ON public.users(email)
    WHERE is_active = TRUE AND deleted_at IS NULL;

-- Expression indexes
CREATE INDEX idx_users_email_lower
    ON public.users(LOWER(email));
```

### 5.3 Query Optimization

```sql
-- Analyze table statistics
ANALYZE public.users;
ANALYZE public.health_profiles;
ANALYZE public.user_allergies;

-- Monitor slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View query performance
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    min_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- Queries taking > 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 6. Constraints and Validation

### 6.1 Business Rule Constraints

```sql
-- Ensure one health profile per user
ALTER TABLE public.health_profiles
    ADD CONSTRAINT uq_one_profile_per_user UNIQUE (user_id);

-- Prevent duplicate allergies
ALTER TABLE public.user_allergies
    ADD CONSTRAINT uq_user_allergen UNIQUE (user_id, allergen_id);

-- Ensure email verification before certain actions
CREATE OR REPLACE FUNCTION check_email_verified()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = NEW.user_id AND is_email_verified = TRUE
    ) THEN
        RAISE EXCEPTION 'User email must be verified';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_email_verified
    BEFORE INSERT ON public.health_profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_email_verified();
```

### 6.2 Data Integrity Triggers

```sql
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Audit log trigger
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.data_changes (
        table_name,
        operation,
        user_id,
        record_id,
        old_data,
        new_data,
        changed_at
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        current_setting('app.current_user_id', TRUE)::UUID,
        COALESCE(NEW.id, OLD.id),
        to_jsonb(OLD),
        to_jsonb(NEW),
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_health_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.health_profiles
    FOR EACH ROW
    EXECUTE FUNCTION audit_changes();
```

---

## 7. Stored Procedures and Functions

### 7.1 User Management Functions

```sql
-- Soft delete user account
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.users
    SET
        deleted_at = CURRENT_TIMESTAMP,
        is_active = FALSE,
        email = email || '_deleted_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)
    WHERE id = p_user_id AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Get user with health profile
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    email VARCHAR,
    profile_id UUID,
    height_cm INTEGER,
    weight_kg DECIMAL,
    allergy_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.email,
        hp.id,
        hp.height_cm,
        hp.weight_kg,
        COUNT(ua.id)::INTEGER
    FROM public.users u
    LEFT JOIN public.health_profiles hp ON u.id = hp.user_id
    LEFT JOIN public.user_allergies ua ON u.id = ua.user_id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.username, u.email, hp.id, hp.height_cm, hp.weight_kg;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Recommendation Functions

```sql
-- Check meal safety for user allergies
CREATE OR REPLACE FUNCTION is_meal_safe_for_user(
    p_user_id UUID,
    p_meal_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_unsafe_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_unsafe_count
    FROM public.user_allergies ua
    JOIN public.meal_ingredients mi ON mi.ingredient_id IN (
        SELECT i.id
        FROM public.ingredients i
        WHERE i.allergen_id = ua.allergen_id
    )
    WHERE ua.user_id = p_user_id
    AND mi.meal_id = p_meal_id
    AND ua.severity IN ('SEVERE', 'LIFE_THREATENING');

    RETURN v_unsafe_count = 0;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Data Migration Strategy

### 8.1 Migration Management

Using Alembic for database migrations:

```python
# alembic.ini configuration
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = postgresql://user:pass@localhost/eatsential

# Migration naming convention
file_template = %%(year)d%%(month).2d%%(day).2d_%%(hour).2d%%(minute).2d_%%(slug)s
```

### 8.2 Migration Best Practices

```sql
-- Example migration with rollback support
-- upgrade()
ALTER TABLE public.users ADD COLUMN phone VARCHAR(20);
CREATE INDEX idx_users_phone ON public.users(phone);

-- downgrade()
DROP INDEX IF EXISTS idx_users_phone;
ALTER TABLE public.users DROP COLUMN phone;
```

### 8.3 Data Seeding

```sql
-- Seed reference data
INSERT INTO health.dietary_restrictions_ref (name, description) VALUES
    ('vegetarian', 'No meat or fish'),
    ('vegan', 'No animal products'),
    ('gluten_free', 'No gluten-containing grains'),
    ('kosher', 'Follows Jewish dietary laws'),
    ('halal', 'Follows Islamic dietary laws'),
    ('keto', 'Low carbohydrate, high fat'),
    ('paleo', 'Paleolithic diet')
ON CONFLICT (name) DO NOTHING;
```

---

## 9. Backup and Recovery

### 9.1 Backup Strategy

```bash
#!/bin/bash
# Daily backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="eatsential"

# Full backup
pg_dump -h localhost -U postgres -d $DB_NAME \
    --format=custom \
    --verbose \
    --file="${BACKUP_DIR}/full_${DB_NAME}_${DATE}.dump"

# Backup specific schemas
pg_dump -h localhost -U postgres -d $DB_NAME \
    --schema=public \
    --schema=health \
    --format=custom \
    --file="${BACKUP_DIR}/app_${DB_NAME}_${DATE}.dump"

# Compress and encrypt
gzip "${BACKUP_DIR}/full_${DB_NAME}_${DATE}.dump"
openssl enc -aes-256-cbc -salt \
    -in "${BACKUP_DIR}/full_${DB_NAME}_${DATE}.dump.gz" \
    -out "${BACKUP_DIR}/full_${DB_NAME}_${DATE}.dump.gz.enc"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/full_${DB_NAME}_${DATE}.dump.gz.enc" \
    s3://eatsential-backups/postgresql/
```

### 9.2 Recovery Procedures

```bash
# Restore from backup
# 1. Decrypt backup
openssl enc -d -aes-256-cbc \
    -in full_eatsential_20251022_120000.dump.gz.enc \
    -out full_eatsential_20251022_120000.dump.gz

# 2. Decompress
gunzip full_eatsential_20251022_120000.dump.gz

# 3. Restore database
pg_restore -h localhost -U postgres \
    --dbname=eatsential_restore \
    --verbose \
    --clean \
    --if-exists \
    full_eatsential_20251022_120000.dump

# 4. Verify restoration
psql -h localhost -U postgres -d eatsential_restore \
    -c "SELECT COUNT(*) FROM public.users;"
```

### 9.3 Point-in-Time Recovery

```sql
-- Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/%f'

-- Restore to specific time
pg_basebackup -h localhost -D /recovery/data -Fp -Xs -P

-- Recovery configuration
restore_command = 'cp /archive/%f %p'
recovery_target_time = '2025-10-22 14:30:00'
```

---

## 10. Security

### 10.1 Access Control

```sql
-- Create roles
CREATE ROLE eatsential_read;
CREATE ROLE eatsential_write;
CREATE ROLE eatsential_admin;

-- Grant permissions
GRANT CONNECT ON DATABASE eatsential TO eatsential_read;
GRANT USAGE ON SCHEMA public, health TO eatsential_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public, health TO eatsential_read;

GRANT eatsential_read TO eatsential_write;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO eatsential_write;

GRANT eatsential_write TO eatsential_admin;
GRANT CREATE ON SCHEMA public TO eatsential_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eatsential_admin;

-- Create application users
CREATE USER app_reader WITH PASSWORD 'secure_password';
GRANT eatsential_read TO app_reader;

CREATE USER app_writer WITH PASSWORD 'secure_password';
GRANT eatsential_write TO app_writer;
```

### 10.2 Encryption

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE TABLE public.user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    card_number_encrypted BYTEA NOT NULL,
    card_holder VARCHAR(255) NOT NULL,
    expires_month INTEGER NOT NULL,
    expires_year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Encrypt function
CREATE OR REPLACE FUNCTION encrypt_card_number(card_number TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(card_number, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;

-- Decrypt function
CREATE OR REPLACE FUNCTION decrypt_card_number(encrypted_data BYTEA)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

### 10.3 Audit Logging

```sql
-- Comprehensive audit table
CREATE TABLE audit.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partition by month for performance
CREATE TABLE audit.access_logs_2025_10 PARTITION OF audit.access_logs
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Automatic partition creation
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'access_logs_' || TO_CHAR(start_date, 'YYYY_MM');

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS audit.%I PARTITION OF audit.access_logs
         FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('create-partitions', '0 0 25 * *', 'SELECT create_monthly_partition()');
```

---

## 9. Mental Wellness Tables (NEW - v2.0)

### 9.1 Purpose

These tables support the **Dual-Dimension Health Platform** architecture, enabling mental wellness tracking alongside physical health features. These tables are **planned but not yet implemented**.

### 9.2 Mental Wellness Goal Management

#### mental_wellness_goals

Stores user-defined mental wellness goals (mood, stress, sleep, mindfulness).

```sql
CREATE TABLE health.mental_wellness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL,
    target_value DECIMAL(5,2) NOT NULL,
    target_unit VARCHAR(20) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_goal_type CHECK (goal_type IN ('mood_improvement', 'stress_reduction', 'sleep_quality', 'sleep_duration', 'mindfulness_practice')),
    CONSTRAINT chk_target_value_positive CHECK (target_value > 0),
    CONSTRAINT chk_target_unit CHECK (target_unit IN ('score', 'hours', 'minutes', 'days_per_week')),
    CONSTRAINT chk_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED')),
    CONSTRAINT chk_date_range CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_notes_length CHECK (LENGTH(notes) <= 500)
);

-- Indexes
CREATE INDEX idx_mental_goals_user_id ON health.mental_wellness_goals(user_id);
CREATE INDEX idx_mental_goals_status ON health.mental_wellness_goals(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_mental_goals_type ON health.mental_wellness_goals(goal_type);
```

### 9.3 Mood & Stress Tracking

#### mood_logs

Daily mood tracking with contextual information.

```sql
CREATE TABLE health.mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mood_score INTEGER NOT NULL,
    mood_label VARCHAR(20) NOT NULL,
    energy_level INTEGER,
    context VARCHAR(100),
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_mood_score CHECK (mood_score BETWEEN 1 AND 10),
    CONSTRAINT chk_mood_label CHECK (mood_label IN ('very_poor', 'poor', 'neutral', 'good', 'excellent')),
    CONSTRAINT chk_energy_level CHECK (energy_level IS NULL OR energy_level BETWEEN 1 AND 10),
    CONSTRAINT chk_context_length CHECK (LENGTH(context) <= 100),
    CONSTRAINT chk_notes_length CHECK (LENGTH(notes) <= 500)
);

-- Indexes
CREATE INDEX idx_mood_logs_user_id ON health.mood_logs(user_id);
CREATE INDEX idx_mood_logs_logged_at ON health.mood_logs(logged_at DESC);
CREATE INDEX idx_mood_logs_user_date ON health.mood_logs(user_id, DATE(logged_at));
```

#### stress_logs

Daily stress level tracking with triggers and coping strategies.

```sql
CREATE TABLE health.stress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stress_level INTEGER NOT NULL,
    stress_label VARCHAR(20) NOT NULL,
    triggers TEXT[],
    coping_strategies TEXT[],
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_stress_level CHECK (stress_level BETWEEN 1 AND 10),
    CONSTRAINT chk_stress_label CHECK (stress_label IN ('minimal', 'low', 'moderate', 'high', 'severe')),
    CONSTRAINT chk_triggers_count CHECK (array_length(triggers, 1) IS NULL OR array_length(triggers, 1) <= 10),
    CONSTRAINT chk_coping_count CHECK (array_length(coping_strategies, 1) IS NULL OR array_length(coping_strategies, 1) <= 10),
    CONSTRAINT chk_notes_length CHECK (LENGTH(notes) <= 500)
);

-- Indexes
CREATE INDEX idx_stress_logs_user_id ON health.stress_logs(user_id);
CREATE INDEX idx_stress_logs_logged_at ON health.stress_logs(logged_at DESC);
CREATE INDEX idx_stress_logs_user_date ON health.stress_logs(user_id, DATE(logged_at));
CREATE INDEX idx_stress_logs_level ON health.stress_logs(stress_level) WHERE stress_level >= 7;
```

### 9.4 Sleep Tracking

#### sleep_logs

Daily sleep quality and duration tracking.

```sql
CREATE TABLE health.sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sleep_date DATE NOT NULL,
    bedtime TIME NOT NULL,
    wake_time TIME NOT NULL,
    duration_hours DECIMAL(4,2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (wake_time - bedtime)) / 3600
    ) STORED,
    quality_score INTEGER NOT NULL,
    quality_label VARCHAR(20) NOT NULL,
    interruptions INTEGER DEFAULT 0,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_quality_score CHECK (quality_score BETWEEN 1 AND 10),
    CONSTRAINT chk_quality_label CHECK (quality_label IN ('very_poor', 'poor', 'fair', 'good', 'excellent')),
    CONSTRAINT chk_interruptions_range CHECK (interruptions BETWEEN 0 AND 20),
    CONSTRAINT chk_notes_length CHECK (LENGTH(notes) <= 500),
    CONSTRAINT uq_user_sleep_date UNIQUE (user_id, sleep_date)
);

-- Indexes
CREATE INDEX idx_sleep_logs_user_id ON health.sleep_logs(user_id);
CREATE INDEX idx_sleep_logs_sleep_date ON health.sleep_logs(sleep_date DESC);
CREATE INDEX idx_sleep_logs_user_date ON health.sleep_logs(user_id, sleep_date DESC);
CREATE INDEX idx_sleep_logs_quality ON health.sleep_logs(quality_score) WHERE quality_score <= 3;
```

### 9.5 Health Tagging System

#### health_tags

Master list of health tags for food categorization (#StressRelief, #MoodBoost, etc.).

```sql
CREATE TABLE health.health_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    scientific_basis TEXT,
    key_nutrients TEXT[],
    effectiveness_rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_tag_name_format CHECK (tag_name ~ '^#[A-Z][a-zA-Z]+$'),
    CONSTRAINT chk_category CHECK (category IN ('Mental Wellness', 'Physical Health', 'Energy', 'Sleep', 'Digestion', 'Immunity')),
    CONSTRAINT chk_description_length CHECK (LENGTH(description) BETWEEN 50 AND 500),
    CONSTRAINT chk_effectiveness CHECK (effectiveness_rating IS NULL OR effectiveness_rating BETWEEN 0.0 AND 5.0)
);

-- Indexes
CREATE INDEX idx_health_tags_category ON health.health_tags(category);
CREATE INDEX idx_health_tags_active ON health.health_tags(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_health_tags_effectiveness ON health.health_tags(effectiveness_rating DESC NULLS LAST);

-- Sample data
INSERT INTO health.health_tags (tag_name, category, description, key_nutrients, effectiveness_rating) VALUES
    ('#StressRelief', 'Mental Wellness', 'Foods that help reduce cortisol levels and promote relaxation', ARRAY['Magnesium', 'Vitamin B6', 'Omega-3'], 4.2),
    ('#MoodBoost', 'Mental Wellness', 'Foods rich in mood-enhancing nutrients like tryptophan and serotonin precursors', ARRAY['Tryptophan', 'Vitamin D', 'Folate'], 4.0),
    ('#SleepAid', 'Sleep', 'Foods containing melatonin or sleep-promoting compounds', ARRAY['Melatonin', 'Magnesium', 'Tryptophan'], 4.5),
    ('#BrainFood', 'Mental Wellness', 'Nutrients that support cognitive function and mental clarity', ARRAY['Omega-3', 'Antioxidants', 'B Vitamins'], 4.3),
    ('#AntiAnxiety', 'Mental Wellness', 'Foods that help calm the nervous system and reduce anxiety', ARRAY['GABA', 'L-Theanine', 'Magnesium'], 3.8);
```

#### food_tags

Many-to-many relationship between foods and health tags.

```sql
CREATE TABLE health.food_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL,
    tag_id UUID NOT NULL REFERENCES health.health_tags(id) ON DELETE CASCADE,
    confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.80,
    source VARCHAR(50) NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_confidence_score CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    CONSTRAINT chk_source CHECK (source IN ('research_paper', 'nutritionist', 'ai_analysis', 'user_feedback', 'database_import')),
    CONSTRAINT uq_food_tag UNIQUE (food_id, tag_id)
);

-- Indexes
CREATE INDEX idx_food_tags_food_id ON health.food_tags(food_id);
CREATE INDEX idx_food_tags_tag_id ON health.food_tags(tag_id);
CREATE INDEX idx_food_tags_verified ON health.food_tags(verified) WHERE verified = TRUE;
CREATE INDEX idx_food_tags_confidence ON health.food_tags(confidence_score DESC);
```

### 9.6 AI Chat Sessions

#### ai_chat_sessions

Stores AI health concierge conversation sessions.

```sql
CREATE TABLE health.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_title VARCHAR(200),
    context_summary TEXT,
    message_count INTEGER DEFAULT 0 NOT NULL,
    total_tokens_used INTEGER DEFAULT 0 NOT NULL,
    llm_model VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_message_count CHECK (message_count >= 0),
    CONSTRAINT chk_tokens CHECK (total_tokens_used >= 0),
    CONSTRAINT chk_llm_model CHECK (llm_model IN ('gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet')),
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'ABANDONED', 'ERROR')),
    CONSTRAINT chk_dates CHECK (ended_at IS NULL OR ended_at >= started_at)
);

-- Indexes
CREATE INDEX idx_ai_sessions_user_id ON health.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_sessions_status ON health.ai_chat_sessions(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_ai_sessions_started ON health.ai_chat_sessions(started_at DESC);
```

### 9.7 Data Privacy Considerations

**Mental Wellness Data Classification**: All mental wellness tables contain **highly sensitive health information** and require additional security measures:

1. **Encryption**:
   - Column-level encryption for `notes`, `context_summary` fields
   - AES-256 encryption using `pgcrypto` extension
   - Separate encryption key rotation for mental health data

2. **Access Control**:
   - Separate database role: `mental_health_reader` (limited access)
   - Audit all mental wellness data queries
   - Require explicit user consent for data access

3. **Data Retention**:
   - User-controlled deletion (24-hour guarantee per NFR-007A)
   - Automatic anonymization after 2 years (configurable)
   - No third-party sharing without explicit consent

4. **Compliance**:
   - HIPAA-compliant storage and transmission
   - GDPR right to be forgotten
   - State-specific mental health data regulations

```sql
-- Enable encryption extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypted notes column
ALTER TABLE health.mood_logs 
ADD COLUMN encrypted_notes BYTEA;

-- Encryption function
CREATE OR REPLACE FUNCTION encrypt_mental_health_note(note TEXT, encryption_key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(note, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decryption function (requires special privilege)
CREATE OR REPLACE FUNCTION decrypt_mental_health_note(encrypted_data BYTEA, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Appendix A: Database Sizing Estimates

### Physical Health Tables (Implemented)

| Table           | Row Size  | Daily Growth | 1 Year Size |
| --------------- | --------- | ------------ | ----------- |
| users           | 500 bytes | 1,000        | 183 MB      |
| health_profiles | 200 bytes | 900          | 66 MB       |
| user_allergies  | 150 bytes | 2,000        | 110 MB      |
| recommendations | 1 KB      | 50,000       | 18 GB       |
| audit_logs      | 500 bytes | 100,000      | 18 GB       |
| **Subtotal**    | -         | -            | **~37 GB**  |

### Mental Wellness Tables (Planned - v2.0)

| Table                    | Row Size  | Daily Growth | 1 Year Size |
| ------------------------ | --------- | ------------ | ----------- |
| mental_wellness_goals    | 300 bytes | 500          | 55 MB       |
| mood_logs                | 250 bytes | 10,000       | 913 MB      |
| stress_logs              | 350 bytes | 8,000        | 1.02 GB     |
| sleep_logs               | 200 bytes | 5,000        | 365 MB      |
| health_tags              | 400 bytes | 10 (static)  | 1 MB        |
| food_tags                | 150 bytes | 1,000        | 55 MB       |
| ai_chat_sessions         | 500 bytes | 2,000        | 365 MB      |
| **Subtotal**             | -         | -            | **~2.8 GB** |

### Total Database Size (Physical + Mental)

| Category          | Size     |
| ----------------- | -------- |
| Physical Health   | ~37 GB   |
| Mental Wellness   | ~2.8 GB  |
| Indexes (~30%)    | ~12 GB   |
| **Total (1 year)**| **~52 GB** |

**Notes**:
- Mental Wellness tables assume 50% user adoption rate
- mood_logs, stress_logs: Average 1-2 entries per active user per day
- sleep_logs: 1 entry per user per day
- AI chat sessions: Average 2 sessions per user per week

## Appendix B: Monitoring Queries

```sql
-- Database size
SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'eatsential';

-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('public', 'health', 'auth')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity
WHERE datname = 'eatsential'
ORDER BY query_start;

-- Slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```
