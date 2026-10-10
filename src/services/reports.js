function createFault(computerId, type, description, source, reporterId, priority = 'MEDIUM', options = {}) {
    let computer = null;
    let lab = null;
    let computerNumber = 'All computers (lab-wide)';
    if (computerId) {
        computer = computers.find(c => c.id === computerId);
        if (!computer) return null;
        lab = LABS.find(l => l.id === computer.labId);
        computerNumber = computer.number;
    } else if (options.labId) {
        lab = LABS.find(l => l.id === options.labId);
        if (!lab) return null;
    } else {
        return null;
    }
    const reporter = users.find(u => u.id === reporterId);
    const nowIso = new Date().toISOString();
    const report = {
        id: faultId++,
        computerId: computerId || null,
        labId: lab.id,
        computerNumber,
        labName: lab ? lab.name : 'Unknown',
        faultType: type,
        description: description,
        source: source,
        priority: priority,
        wholeLab: !computerId,
        status: 'OPEN',
        reportedBy: reporterId,
        assignedTechnician: null,
        reportedAt: nowIso,
        resolvedAt: null,
        confirmations: [reporterId],
        notes: [],
        history: [{ status: 'OPEN', at: nowIso, by: reporterId, actorName: reporter ? reporter.name : 'Unknown', note: '' }]
    };
    faults.push(report);
    // User reports and ticket resolution must not mutate telemetry.
    return report;
}

// A student confirms an already-reported, unresolved fault instead of filing a duplicate.
function confirmFault(fault, userId) {
    if (!fault.confirmations) fault.confirmations = [fault.reportedBy];
    if (fault.confirmations.includes(userId)) return false;
    fault.confirmations.push(userId);
    const actor = users.find(u => u.id === userId);
    fault.history.push({ status: fault.status, at: new Date().toISOString(), by: userId, actorName: actor ? actor.name : 'Unknown', note: 'Confirmed this fault is still occurring.' });
    return true;
}

// Enforces the Open -> Acknowledged -> In Progress -> Resolved -> Closed/Reopened workflow.
function changeFaultStatus(fault, newStatus, actor, note) {
    const allowed = FAULT_TRANSITIONS[fault.status] || [];
    if (!allowed.includes(newStatus)) {
        return { ok: false, error: `Cannot move a ${fault.status.replace('_', ' ')} ticket to ${newStatus.replace('_', ' ')}.` };
    }
    fault.status = newStatus;
    if (newStatus === 'RESOLVED') fault.resolvedAt = new Date().toISOString();
    else if (newStatus === 'REOPENED') fault.resolvedAt = null;
    fault.history.push({ status: newStatus, at: new Date().toISOString(), by: actor.id, actorName: actor.name, note: note || '' });
    return { ok: true };
}

function assignFault(fault, technicianId, actor) {
    const tech = users.find(u => u.id === technicianId);
    if (!tech || tech.role !== 'TECHNICIAN') return { ok: false, error: 'Select a valid technician.' };
    fault.assignedTechnician = technicianId;
    fault.history.push({ status: fault.status, at: new Date().toISOString(), by: actor.id, actorName: actor.name, note: `Assigned to ${tech.name}.` });
    return { ok: true };
}

