-- Ticket action audit trail: actor, time and note for every status change or assignment.
-- Mirrors fault.history entries appended by changeFaultStatus()/assignFault() in
-- src/services/reports.js, rendered by the "View" action in src/pages/faults.js.
CREATE TABLE fault_history (
    id                  SERIAL PRIMARY KEY,
    fault_report_id     INTEGER NOT NULL REFERENCES fault_reports (id) ON DELETE CASCADE,
    status              TEXT NOT NULL
                            CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED')),
    actor_id            UUID NOT NULL REFERENCES users (id),
    note                TEXT NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fault_history_fault_report_id ON fault_history (fault_report_id);
CREATE INDEX idx_fault_history_created_at ON fault_history (created_at);
