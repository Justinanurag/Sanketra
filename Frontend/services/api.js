const wait = (value, delay = 220) => new Promise((resolve) => setTimeout(() => resolve(value), delay))

export async function getDashboard() { return wait({ totalReports: 128, highSif: 12, mediumSif: 31, needsReview: 9 }) }
export async function getReports() { return wait([]) }
export async function getReport(id) { return wait({ id, status: 'mock' }) }
export async function analyzeReport(id) { return wait({ id, sifPotential: 'HIGH', confidence: 94, demo: true }) }
export async function getSimilarReports(id) { return wait({ id, reports: [] }) }
export async function uploadCCTV(file) { return wait({ id: 'cctv-demo-01', filename: file?.name, demo: true }) }
export async function analyzeCCTV(id) { return wait({ id, status: 'complete', demo: true }) }
export async function getCorrelation(id) { return wait({ id, claims: [] }) }
export async function submitReview(id, data) { return wait({ id, ...data, status: 'confirmed' }) }

// Future endpoints are intentionally kept here as the integration contract:
// POST /api/reports · GET /api/reports · GET /api/reports/:id
// POST /api/reports/:id/analyze · GET /api/reports/:id/similar
// POST /api/cctv/upload · POST /api/cctv/:id/analyze
// POST /api/correlation/analyze · POST /api/reviews · GET /api/dashboard
