-- Fault tickets. Mirrors the fault object created by createFault() in src/services/reports.js.
-- computer_id is nullable to support a Lecturer's whole-lab report (fault.wholeLab = true).
CREATE TABLE fault_reports (
    id                      SERIAL PRIMARY KEY,
    computer_id             INTEGER REFERENCES computers (id) ON DELETE SET NULL,
    lab_id                  INTEGER NOT NULL REFERENCES laboratories (id) ON DELETE CASCADE,
    fault_type_id           INTEGER NOT NULL REFERENCES fault_types (id),
    description             TEXT NOT NULL,
    source                  TEXT NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'AUTO')),
    priority                TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    whole_lab               BOOLEAN NOT NULL DEFAULT FALSE,
    status                  TEXT NOT NULL DEFAULT 'OPEN'
                                CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED')),
    reported_by             UUID NOT NULL REFERENCES users (id),
    assigned_technician     UUID REFERENCES users (id),
    reported_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at             TIMESTAMPTZ,
    CONSTRAINT chk_whole_lab_computer CHECK (
        (whole_lab AND computer_id IS NULL) OR (NOT whole_lab AND computer_id IS NOT NULL)
    )
);

CREATE INDEX idx_fault_reports_computer_id ON fault_reports (computer_id);
CREATE INDEX idx_fault_reports_lab_id ON fault_reports (lab_id);
CREATE INDEX idx_fault_reports_status ON fault_reports (status);
CREATE INDEX idx_fault_reports_assigned_technician ON fault_reports (assigned_technician);

-- Keep separate faults separate: only one unresolved ticket per computer + fault type.
-- Matches the duplicate check in src/pages/report.js (students confirm instead of duplicating).
CREATE UNIQUE INDEX idx_fault_reports_open_dedupe
    ON fault_reports (computer_id, fault_type_id)
    WHERE computer_id IS NOT NULL AND status NOT IN ('RESOLVED', 'CLOSED');
