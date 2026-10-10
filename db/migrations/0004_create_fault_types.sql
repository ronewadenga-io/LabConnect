-- Fault category lookup. Mirrors FAULT_TYPES in src/config/constants.js.
CREATE TABLE fault_types (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE
);
