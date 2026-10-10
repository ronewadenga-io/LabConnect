const STATUSES = ['HEALTHY', 'WARNING', 'FAULT_REPORTED', 'UNDER_MAINTENANCE', 'OFFLINE'];
const STATUS_MAP = {
    HEALTHY: { label: 'Healthy', cls: 'healthy', icon: 'fa-check-circle', color: '#666b20' },
    WARNING: { label: 'Warning', cls: 'warning', icon: 'fa-triangle-exclamation', color: '#a65b20' },
    FAULT_REPORTED: { label: 'Faulty', cls: 'critical', icon: 'fa-circle-exclamation', color: '#bb521e' },
    UNDER_MAINTENANCE: { label: 'Maintenance', cls: 'maintenance', icon: 'fa-tools', color: '#686853' },
    OFFLINE: { label: 'Offline', cls: 'offline', icon: 'fa-power-off', color: '#6c757d' },
};

const FAULT_TYPES = [
    'Computer Not Starting',
    'Network Problem',
    'Internet Problem',
    'Keyboard Problem',
    'Mouse Problem',
    'Monitor/Display Problem',
    'Login Problem',
    'Software Problem',
    'Slow Computer',
    'Physical Damage',
    'Other'
];

const FAULT_SOURCES = ['MANUAL', 'AUTO'];
const FAULT_STATUSES = ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'];

// Ticket workflow: Open -> Acknowledged -> In Progress -> Resolved -> Closed, with Reopened for a failed repair.
const FAULT_TRANSITIONS = {
    OPEN: ['ACKNOWLEDGED'],
    ACKNOWLEDGED: ['IN_PROGRESS'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: ['CLOSED', 'REOPENED'],
    REOPENED: ['ACKNOWLEDGED'],
    CLOSED: []
};

// Buttons offered per status: [newStatus, label, icon, buttonClass, noteRequired]
const FAULT_ACTIONS = {
    OPEN: [['ACKNOWLEDGED', 'Acknowledge', 'fa-check', 'btn-success', false]],
    ACKNOWLEDGED: [['IN_PROGRESS', 'Start', 'fa-play', 'btn-warning', false]],
    IN_PROGRESS: [['RESOLVED', 'Resolve', 'fa-check-double', 'btn-teal', true]],
    RESOLVED: [['CLOSED', 'Close', 'fa-box-archive', 'btn-primary', false], ['REOPENED', 'Reopen', 'fa-rotate-left', 'btn-danger', true]],
    REOPENED: [['ACKNOWLEDGED', 'Acknowledge', 'fa-check', 'btn-success', false]],
    CLOSED: []
};
