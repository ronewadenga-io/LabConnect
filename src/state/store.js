const LABS = [];
let users = [];

// Generate computers
let computers = [];

// Fault reports
let faults = [];
let faultId = 1;
let currentUser = null;
let currentPage = 'dashboard';
let selectedLabId = null;
let selectedComputerId = null;
const localComputerId = null;
let reportStatusFilter = 'All';
let previewLabFilter = 'ALL';
let previewConditionFilter = 'ALL';
let previewSearch = '';
let reportsPersisted = true;
