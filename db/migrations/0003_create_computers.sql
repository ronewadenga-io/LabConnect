-- Registered lab machines, including the head node. Mirrors `computers` in src/state/store.js.
CREATE TABLE computers (
    id              SERIAL PRIMARY KEY,
    lab_id          INTEGER NOT NULL REFERENCES laboratories (id) ON DELETE CASCADE,
    number          TEXT NOT NULL,
    hostname        TEXT NOT NULL,
    node_role       TEXT NOT NULL DEFAULT 'COMPUTE' CHECK (node_role IN ('HEAD', 'COMPUTE')),
    os              TEXT NOT NULL DEFAULT 'Unregistered',
    status          TEXT NOT NULL DEFAULT 'HEALTHY'
                        CHECK (status IN ('HEALTHY', 'WARNING', 'FAULT_REPORTED', 'UNDER_MAINTENANCE', 'OFFLINE')),
    online          BOOLEAN NOT NULL DEFAULT TRUE,
    network         TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (network IN ('CONNECTED', 'UNKNOWN', 'DISCONNECTED')),
    agent_status    TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (agent_status IN ('RESPONDING', 'UNKNOWN', 'NOT_RESPONDING')),
    free_gb         NUMERIC,
    total_gb        NUMERIC,
    last_seen       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_computers_lab_id ON computers (lab_id);
CREATE UNIQUE INDEX idx_computers_lab_number ON computers (lab_id, number);
