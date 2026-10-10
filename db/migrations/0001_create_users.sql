-- Accounts for all four workspace roles (Student, Lecturer, Technician, Administrator).
-- Mirrors the record shape created by src/pages/auth.js signup.
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('STUDENT', 'LECTURER', 'TECHNICIAN', 'ADMIN')),
    initials        TEXT NOT NULL,
    onboarded       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users (role);
