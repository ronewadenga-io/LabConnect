-- Laboratory groups. Mirrors LABS in src/state/store.js.
CREATE TABLE laboratories (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    building        TEXT NOT NULL DEFAULT 'Unassigned building',
    room            TEXT NOT NULL DEFAULT 'Unassigned room',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
