-- Seed the 11 fault categories offered by the report form (FAULT_TYPES in src/config/constants.js).
INSERT INTO fault_types (name) VALUES
    ('Computer Not Starting'),
    ('Network Problem'),
    ('Internet Problem'),
    ('Keyboard Problem'),
    ('Mouse Problem'),
    ('Monitor/Display Problem'),
    ('Login Problem'),
    ('Software Problem'),
    ('Slow Computer'),
    ('Physical Damage'),
    ('Other')
ON CONFLICT (name) DO NOTHING;
