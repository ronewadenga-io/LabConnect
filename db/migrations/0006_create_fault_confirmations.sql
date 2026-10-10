-- Students who confirmed an existing unresolved fault instead of filing a duplicate.
-- Mirrors fault.confirmations in src/services/reports.js (confirmFault()).
CREATE TABLE fault_confirmations (
    fault_report_id     INTEGER NOT NULL REFERENCES fault_reports (id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users (id),
    confirmed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (fault_report_id, user_id)
);
